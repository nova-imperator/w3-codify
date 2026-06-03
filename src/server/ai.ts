import { prisma } from "@/lib/prisma";
import type { SystemBlock, ChatMsg } from "@/lib/anthropic";

/** Frozen guardrail prompt — identical every request, so it caches cleanly. */
const TUTOR_GUARDRAILS = `You are the W3Codify AI Tutor — a patient, encouraging coding mentor for students at an online coding school.

Your job:
- Explain programming and computer-science concepts clearly, with small concrete examples.
- Help debug errors: identify the cause, explain why, and show a corrected snippet.
- Adapt to the student's level; never condescend.

Rules:
- Stay on topic: coding, the current lesson, and learning. Politely decline unrelated requests.
- For graded assignments or quizzes, COACH toward the answer with hints and steps — do not just hand over the full solution.
- Be concise. Use Markdown: short paragraphs, fenced \`\`\`code\`\`\` blocks with a language, and bullet lists where helpful.
- If you don't know, say so rather than inventing APIs.`;

/** System blocks for the tutor: stable guardrails + (optional) lesson context, both cached. */
export function buildTutorSystem(ctx?: {
  courseTitle: string;
  lessonTitle: string;
  contextText: string;
}): SystemBlock[] {
  const blocks: SystemBlock[] = [
    { type: "text", text: TUTOR_GUARDRAILS, cache_control: { type: "ephemeral" } },
  ];
  if (ctx) {
    blocks.push({
      type: "text",
      text: `Current lesson context (the student is studying this right now):\nCourse: ${ctx.courseTitle}\nLesson: ${ctx.lessonTitle}\n\n${ctx.contextText}`.slice(0, 8000),
      cache_control: { type: "ephemeral" },
    });
  }
  return blocks;
}

export function buildExplainSystem(): SystemBlock[] {
  return [
    {
      type: "text",
      text: `You are the W3Codify AI Tutor giving a quick public demo. Explain the user's coding question or code clearly and briefly in Markdown, with a short example if useful. Keep it under ~150 words. Stay strictly on coding/learning topics; politely decline anything else.`,
      cache_control: { type: "ephemeral" },
    },
  ];
}

/** Extract readable text from a lesson's blocks for tutor context. */
export async function getLessonContext(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      blocks: { orderBy: { order: "asc" } },
      section: { include: { course: { select: { id: true, title: true } } } },
    },
  });
  if (!lesson) return null;

  const parts: string[] = [];
  for (const b of lesson.blocks) {
    const d = (b.data as Record<string, unknown>) ?? {};
    if (b.type === "TEXT" && typeof d.md === "string") parts.push(d.md);
    else if (b.type === "CALLOUT" && typeof d.md === "string") parts.push(`Note: ${d.md}`);
    else if (b.type === "CODE" && typeof d.code === "string")
      parts.push(`Code (${d.lang ?? ""}):\n${d.code}`);
    else if (b.type === "QUIZ" && typeof d.question === "string")
      parts.push(`Quiz: ${d.question}`);
  }
  return {
    courseId: lesson.section.course.id,
    courseTitle: lesson.section.course.title,
    lessonTitle: lesson.title,
    contextText: parts.join("\n\n").slice(0, 6000) || "(No written content for this lesson yet.)",
  };
}

// ─────────────────────────── Thread persistence ───────────────────────────
export async function loadThread(threadId: string, userId: string) {
  const thread = await prisma.aiThread.findFirst({
    where: { id: threadId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return thread;
}

export async function createThread(userId: string, courseId: string | null, title: string) {
  return prisma.aiThread.create({
    data: { userId, courseId: courseId ?? null, title: title.slice(0, 80) },
  });
}

export async function appendMessage(
  threadId: string,
  role: "user" | "assistant",
  content: string,
) {
  return prisma.aiMessage.create({ data: { threadId, role, content } });
}

/** Recent history as Claude messages (capped to keep prompts lean). */
export function toChatMessages(
  history: { role: string; content: string }[],
  max = 12,
): ChatMsg[] {
  return history
    .slice(-max)
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
}
