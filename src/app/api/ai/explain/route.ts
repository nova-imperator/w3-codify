import { NextResponse } from "next/server";
import { z } from "zod";
import { createAiStream, AI_MODELS, STREAM_HEADERS } from "@/lib/anthropic";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { buildExplainSystem } from "@/server/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().trim().min(1).max(2000),
  code: z.string().max(4000).optional(),
  language: z.string().max(40).optional(),
});

// POST /api/ai/explain — public, rate-limited home-page teaser (§8.5).
// Unauthenticated-safe; uses the cheaper Haiku model.
export async function POST(req: Request) {
  const rl = rateLimit(`ai:explain:${clientIp(req)}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demo limit reached. Sign up free to keep chatting with the AI tutor." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { message, code, language } = parsed.data;

  const userContent = code
    ? `${message}\n\n\`\`\`${language ?? ""}\n${code}\n\`\`\``
    : message;

  const mock = mockAnswer(message);

  const stream = createAiStream({
    system: buildExplainSystem(),
    messages: [{ role: "user", content: userContent }],
    model: AI_MODELS.cheap,
    maxTokens: 512,
    mockText: mock,
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}

function mockAnswer(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("useeffect")) {
    return "In React 18+ dev mode, effects run twice on mount (Strict Mode) to surface bugs — production runs once. Make effects idempotent and clean up:\n\n```js\nuseEffect(() => {\n  const id = subscribe();\n  return () => unsubscribe(id);\n}, []);\n```\n\n_(Demo — set ANTHROPIC_API_KEY for live AI.)_";
  }
  if (lower.includes("gradient")) {
    return "Gradient descent is like walking downhill in fog: feel the slope and step down a little (`learning_rate`) at a time, repeating until the error stops dropping. That's how a model tunes its weights to reduce loss.\n\n_(Demo — set ANTHROPIC_API_KEY for live AI.)_";
  }
  return "Good question! Paste your code or the exact error and I'll explain what's happening and show a fix, step by step. In the full classroom I also see your current lesson for context.\n\n_(Demo — set ANTHROPIC_API_KEY for live AI.)_";
}
