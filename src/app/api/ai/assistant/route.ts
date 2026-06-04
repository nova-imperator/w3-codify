import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/session";
import { isFeatureEnabled } from "@/server/flags";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { streamChat, STREAM_HEADERS, buildAssistantSystem, getCourseCatalog } from "@/server/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(12)
    .optional(),
});

// POST /api/ai/assistant — the floating site chatbot (§8.0). Public: works
// signed-out (tighter IP limit) and signed-in (higher per-user limit). Streams.
export async function POST(req: Request) {
  if (!(await isFeatureEnabled("chatbot"))) {
    return NextResponse.json({ error: "The assistant is currently unavailable." }, { status: 403 });
  }

  const user = await getCurrentUser();

  // Signed-in users get a generous per-user budget; anonymous visitors a lighter per-IP one.
  const rl = user
    ? rateLimit(`ai:assistant:u:${user.id}`, 30, 60_000)
    : rateLimit(`ai:assistant:ip:${clientIp(req)}`, 12, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: user
          ? "You're sending messages too fast. Please slow down."
          : "You've hit the free chat limit. Sign in to keep going — it's free.",
      },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { message, history = [] } = parsed.data;

  const catalog = await getCourseCatalog();
  const system = buildAssistantSystem(catalog, !!user);

  const stream = streamChat({
    system,
    messages: [...history, { role: "user", content: message }],
    task: "cheap",
    maxTokens: 700,
    temperature: 0.6,
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
