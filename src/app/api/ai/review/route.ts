import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { streamChat, STREAM_HEADERS, REVIEW_SYSTEM } from "@/server/ai";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ projectId: z.string().min(1) });

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

  const stream = streamChat(
    {
      system: REVIEW_SYSTEM,
      messages: [{ role: "user", content: userContent }],
      task: "tutor",
      maxTokens: 700,
      temperature: 0.3,
    },
    {
      onComplete: async (full) => {
        if (full.trim()) {
          await prisma.project.update({
            where: { id: project.id },
            data: { aiReview: { feedback: full, at: new Date().toISOString() }, status: "reviewed" },
          });
        }
      },
    },
  );

  return new Response(stream, { headers: STREAM_HEADERS });
}
