/**
 * Multi-provider AI abstraction (BUILD_SPEC §8). One uniform streaming interface
 * behind which we run OpenAI (primary) → Gemini (fallback), with automatic
 * fail-over: if a provider errors / 429s / times out BEFORE it streams its first
 * token, we transparently try the next provider in the list. Order is
 * config-driven via AI_PROVIDER_ORDER. Keys never leave the server.
 */

export type AiRole = "user" | "assistant";
export type AiMessage = { role: AiRole; content: string };
export type AiTask = "tutor" | "cheap";

export type AiRequest = {
  system: string;
  messages: AiMessage[];
  task?: AiTask;
  maxTokens?: number;
  temperature?: number;
};

/** One config map so model IDs are easy to bump (§8). */
const MODELS = {
  openai: { tutor: "gpt-4o", cheap: "gpt-4o-mini" },
  gemini: { tutor: "gemini-2.5-flash", cheap: "gemini-2.5-flash-lite" },
} as const;

export type ProviderName = keyof typeof MODELS;

const CONNECT_TIMEOUT_MS = 18_000;

function keyFor(name: ProviderName): string {
  const raw =
    name === "openai" ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY;
  return (raw ?? "").trim();
}

function isConfigured(name: ProviderName): boolean {
  const k = keyFor(name);
  return !!k && !k.includes("<") && !k.includes("FILL_ME");
}

/** Providers to try, in order, filtered to those with a usable key. */
export function providerOrder(): ProviderName[] {
  const raw = process.env.AI_PROVIDER_ORDER ?? "openai,gemini";
  const wanted = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((n): n is ProviderName => n === "openai" || n === "gemini");
  const order = wanted.length ? wanted : (["openai", "gemini"] as ProviderName[]);
  return order.filter(isConfigured);
}

// ───────────────────────────── SSE helper ─────────────────────────────
/** Yields complete text lines from a fetch SSE body. */
async function* sseLines(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) yield line;
    }
  }
  if (buf.trim()) yield buf.trim();
}

// ───────────────────────────── OpenAI ─────────────────────────────
async function* streamOpenAI(req: AiRequest): AsyncGenerator<string> {
  const model = MODELS.openai[req.task ?? "tutor"];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keyFor("openai")}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(CONNECT_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.5,
      messages: [{ role: "system", content: req.system }, ...req.messages],
    }),
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`openai ${res.status}: ${detail.slice(0, 200)}`);
  }
  for await (const line of sseLines(res.body)) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (data === "[DONE]") return;
    try {
      const json = JSON.parse(data);
      const delta: string | undefined = json.choices?.[0]?.delta?.content;
      if (delta) yield delta;
    } catch {
      /* ignore keep-alive / partial */
    }
  }
}

// ───────────────────────────── Gemini ─────────────────────────────
async function* streamGemini(req: AiRequest): AsyncGenerator<string> {
  const model = MODELS.gemini[req.task ?? "tutor"];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${keyFor("gemini")}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(CONNECT_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.system }] },
      contents: req.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: req.maxTokens ?? 1024,
        temperature: req.temperature ?? 0.5,
      },
    }),
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`gemini ${res.status}: ${detail.slice(0, 200)}`);
  }
  for await (const line of sseLines(res.body)) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    try {
      const json = JSON.parse(data);
      const parts: { text?: string }[] = json.candidates?.[0]?.content?.parts ?? [];
      for (const p of parts) if (p.text) yield p.text;
    } catch {
      /* ignore */
    }
  }
}

const IMPL: Record<ProviderName, (req: AiRequest) => AsyncGenerator<string>> = {
  openai: streamOpenAI,
  gemini: streamGemini,
};

export const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  "X-Accel-Buffering": "no",
};

/**
 * Stream a chat completion as a token text stream, failing over across providers
 * before the first token. Logs which provider served (debug). `onComplete` gets
 * the full text + the provider that answered (for persistence).
 */
export function streamChat(
  req: AiRequest,
  opts?: {
    onComplete?: (fullText: string, provider: ProviderName | null) => void | Promise<void>;
    onProvider?: (provider: ProviderName) => void;
  },
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const order = providerOrder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      let served: ProviderName | null = null;

      for (const name of order) {
        try {
          const iter = IMPL[name](req)[Symbol.asyncIterator]();
          // The first .next() runs the provider up to its first token; any
          // connect/HTTP/timeout error throws HERE → we can still fail over.
          let step = await iter.next();
          // Commit to this provider — it connected and started producing.
          served = name;
          console.log(`[ai] served by ${name} (task=${req.task ?? "tutor"})`);
          opts?.onProvider?.(name);
          while (!step.done) {
            if (step.value) {
              full += step.value;
              controller.enqueue(encoder.encode(step.value));
            }
            step = await iter.next();
          }
          break; // finished cleanly
        } catch (err) {
          if (full.length > 0) {
            // Already streaming — can't transparently fail over now.
            const note = "\n\n_(The AI response was interrupted — please try again.)_";
            full += note;
            controller.enqueue(encoder.encode(note));
            console.warn(`[ai] ${name} failed mid-stream: ${String(err).slice(0, 160)}`);
            break;
          }
          console.warn(`[ai] ${name} failed before streaming, failing over: ${String(err).slice(0, 160)}`);
          continue; // try next provider
        }
      }

      if (served === null) {
        const msg =
          order.length === 0
            ? "The AI service isn't configured yet. Please try again later."
            : "Sorry — the AI service is temporarily unavailable. Please try again.";
        full = msg;
        controller.enqueue(encoder.encode(msg));
        console.error("[ai] all providers failed or none configured");
      }

      try {
        await opts?.onComplete?.(full, served);
      } finally {
        controller.close();
      }
    },
  });
}
