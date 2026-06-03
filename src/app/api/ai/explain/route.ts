import { NextResponse } from "next/server";
import { z } from "zod";
import { streamChat, STREAM_HEADERS, buildExplainSystem } from "@/server/ai";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().trim().min(1).max(2000),
  code: z.string().max(4000).optional(),
  language: z.string().max(40).optional(),
});

// POST /api/ai/explain — public, rate-limited home-page teaser (§8.5).
// Unauthenticated-safe; uses the cheaper model tier.
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

  const stream = streamChat({
    system: buildExplainSystem(),
    messages: [{ role: "user", content: userContent }],
    task: "cheap",
    maxTokens: 512,
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
