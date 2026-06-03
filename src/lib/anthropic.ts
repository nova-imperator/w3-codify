import Anthropic from "@anthropic-ai/sdk";

/** Models per BUILD_SPEC §8: Sonnet for the tutor, Haiku for cheap tasks. */
export const AI_MODELS = {
  tutor: "claude-sonnet-4-6",
  cheap: "claude-haiku-4-5",
} as const;

export function isAnthropicConfigured(): boolean {
  const k = process.env.ANTHROPIC_API_KEY ?? "";
  return !!k && !k.includes("<") && !k.includes("FILL_ME");
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic(); // reads ANTHROPIC_API_KEY
  return client;
}

export type SystemBlock = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};
export type ChatMsg = { role: "user" | "assistant"; content: string };

/**
 * Returns a text ReadableStream for a chat completion. Uses the real Claude
 * streaming API when configured (with prompt caching on the system blocks),
 * else streams `mockText` token-by-token so the UX is identical without a key.
 * `onComplete` receives the full text once streaming ends (for persistence).
 */
export function createAiStream(opts: {
  system: SystemBlock[];
  messages: ChatMsg[];
  model?: string;
  maxTokens?: number;
  mockText: string;
  onComplete?: (fullText: string) => void | Promise<void>;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const { system, messages, mockText, onComplete } = opts;
  const model = opts.model ?? AI_MODELS.tutor;
  const maxTokens = opts.maxTokens ?? 1024;

  if (!isAnthropicConfigured()) {
    return new ReadableStream({
      async start(controller) {
        const tokens = mockText.split(/(\s+)/);
        let full = "";
        for (const t of tokens) {
          full += t;
          controller.enqueue(encoder.encode(t));
          await new Promise((r) => setTimeout(r, 16));
        }
        await onComplete?.(full);
        controller.close();
      },
    });
  }

  return new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        const stream = getClient().messages.stream({
          model,
          max_tokens: maxTokens,
          // thinking off → snappy interactive replies; system carries cache_control.
          system,
          messages,
        });
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        await onComplete?.(full);
      } catch {
        const msg =
          "\n\n_Sorry — the AI service is temporarily unavailable. Please try again._";
        controller.enqueue(encoder.encode(msg));
        await onComplete?.(full + msg);
      } finally {
        controller.close();
      }
    },
  });
}

/** Standard headers for a streamed text response from a Route Handler. */
export const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  "X-Accel-Buffering": "no",
};
