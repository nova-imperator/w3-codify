import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { createAiStream, AI_MODELS, STREAM_HEADERS, type SystemBlock } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ projectId: z.string().min(1) });

const REVIEW_SYSTEM: SystemBlock[] = [
  {
    type: "text",
    text: `You are a senior engineer reviewing a student's portfolio project at a coding school. Give concise, encouraging, actionable feedback in Markdown with exactly these sections:\n\n**Correctness** — likely strengths and risks based on the described project.\n**Readability & structure** — what to check and improve.\n**Next steps** — 3 concrete, prioritized improvements.\n\nBe specific and kind. If you lack the code, say what you'd look for. Keep it under ~200 words.`,
    cache_control: { type: "ephemeral" },
  },
];

// POST /api/ai/review { projectId } — AI project review, streamed + persisted (§8.3).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const rl = rateLimit(`ai:review:${user.id}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Please slow down." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, userId: user.id },
  });
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const userContent = `Review this project:\nTitle: ${project.title}\nRepo: ${project.repoUrl ?? "(none provided)"}\nLive: ${project.liveUrl ?? "(none provided)"}`;

  const mock = `**Correctness** — The concept is solid. Verify edge cases and add tests around the core logic.\n\n**Readability & structure** — Keep functions small and named clearly; add a README with setup steps.\n\n**Next steps**\n1. Add a test suite for the main flow.\n2. Handle and surface errors to the user.\n3. Write a short README with screenshots.\n\n_(Demo review — set ANTHROPIC_API_KEY for live AI feedback.)_`;

  const stream = createAiStream({
    system: REVIEW_SYSTEM,
    messages: [{ role: "user", content: userContent }],
    model: AI_MODELS.tutor,
    maxTokens: 700,
    mockText: mock,
    onComplete: async (full) => {
      if (full.trim()) {
        await prisma.project.update({
          where: { id: project.id },
          data: { aiReview: { feedback: full, at: new Date().toISOString() }, status: "reviewed" },
        });
      }
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
