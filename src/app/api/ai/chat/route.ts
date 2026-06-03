import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/session";
import { createAiStream, AI_MODELS, STREAM_HEADERS } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";
import {
  buildTutorSystem,
  getLessonContext,
  loadThread,
  createThread,
  appendMessage,
  toChatMessages,
} from "@/server/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().trim().min(1).max(4000),
  threadId: z.string().optional(),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
});

// POST /api/ai/chat — context-aware tutor chat, streamed + persisted (§8.1).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const rl = rateLimit(`ai:chat:${user.id}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "You're sending messages too fast. Please slow down." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { message, threadId, lessonId } = parsed.data;

  const ctx = lessonId ? await getLessonContext(lessonId) : null;

  // Resolve or create the thread (ownership-checked).
  let thread = threadId ? await loadThread(threadId, user.id) : null;
  if (!thread) {
    const created = await createThread(user.id, ctx?.courseId ?? parsed.data.courseId ?? null, message);
    thread = { ...created, messages: [] };
  }

  const history = toChatMessages(thread.messages);
  await appendMessage(thread.id, "user", message);

  const mockText = ctx
    ? `Great question about **${ctx.lessonTitle}**! Here's how I'd think about it:\n\n- Break the problem into the smallest piece you don't yet understand.\n- Re-read the relevant part of the lesson and try a tiny example.\n\nTell me which line or concept is tripping you up and I'll walk through it step by step.\n\n_(Demo response — set ANTHROPIC_API_KEY to enable the live AI tutor.)_`
    : `Happy to help! Share the code or the exact error message and I'll explain what's happening and how to fix it, step by step.\n\n_(Demo response — set ANTHROPIC_API_KEY to enable the live AI tutor.)_`;

  const stream = createAiStream({
    system: buildTutorSystem(ctx ?? undefined),
    messages: [...history, { role: "user", content: message }],
    model: AI_MODELS.tutor,
    maxTokens: 1024,
    mockText,
    onComplete: async (full) => {
      if (full.trim()) await appendMessage(thread!.id, "assistant", full);
    },
  });

  return new Response(stream, {
    headers: { ...STREAM_HEADERS, "X-Thread-Id": thread.id },
  });
}
