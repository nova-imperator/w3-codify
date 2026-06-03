import { prisma } from "@/lib/prisma";

/** Frozen guardrail prompt for the in-classroom tutor (§8.1). */
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

/** Tutor system prompt: guardrails + optional current-lesson context. */
export function buildTutorSystem(ctx?: {
  courseTitle: string;
  lessonTitle: string;
  contextText: string;
}): string {
  if (!ctx) return TUTOR_GUARDRAILS;
  const context =
    `\n\nCurrent lesson context (the student is studying this right now):\nCourse: ${ctx.courseTitle}\nLesson: ${ctx.lessonTitle}\n\n${ctx.contextText}`.slice(
      0,
      8000,
    );
  return TUTOR_GUARDRAILS + context;
}

/** Public home-page teaser prompt (§8.5) — short, on-topic, unauthenticated-safe. */
export function buildExplainSystem(): string {
  return `You are the W3Codify AI Tutor giving a quick public demo. Explain the user's coding question or code clearly and briefly in Markdown, with a short example if useful. Keep it under ~150 words. Stay strictly on coding/learning topics; politely decline anything else.`;
}

/** Project-review prompt (§8.3). */
export const REVIEW_SYSTEM = `You are a senior engineer reviewing a student's portfolio project at a coding school. Give concise, encouraging, actionable feedback in Markdown with exactly these sections:

**Correctness** — likely strengths and risks based on the described project.
**Readability & structure** — what to check and improve.
**Next steps** — 3 concrete, prioritized improvements.

Be specific and kind. If you lack the code, say what you'd look for. Keep it under ~200 words.`;

/** Site chatbot prompt (§8.0) — concierge + general coding helper, grounded in the live catalog. */
export function buildAssistantSystem(catalog: string, signedIn: boolean): string {
  return `You are the W3Codify assistant — a friendly concierge on an AI-powered online coding school's website.

What you help with:
- Recommend the right course ("which course should I take?") based on the visitor's goals, using ONLY the catalog below.
- Answer questions about pricing, format, and how the school works.
- General coding / computer-science help and quick explanations.

Key facts:
- Every course is currently **FREE** (launch offer) — no card required.
- Each course runs Basics refresher → Advanced → GOD tier, with real projects, quizzes, an AI tutor, and a completion certificate.
- To start, the visitor signs in (phone OTP or Google) at /auth/signin and enrolls for free.

Live course catalog (use these exact links when recommending):
${catalog}

Rules:
- Be concise and warm. Use Markdown. When recommending a course, link it like [Course Title](/courses/slug). Point people to [Sign in](/auth/signin) or [Browse courses](/courses) when relevant.
- Stay on topic (W3Codify, courses, learning, coding). Politely decline unrelated requests.
- For graded quiz/assignment answers, coach with hints — don't just hand over solutions.
- Never invent courses, prices, or APIs. If unsure, say so.
- The visitor is currently ${signedIn ? "signed in" : "signed out"}.`;
}

/** Compact catalog string for the assistant, from the live DB. */
export async function getCourseCatalog(): Promise<string> {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true, subtitle: true, tags: true, level: true },
    orderBy: { createdAt: "asc" },
    take: 24,
  });
  if (!courses.length) return "(No courses are published yet.)";
  return courses
    .map(
      (c) =>
        `- ${c.title} — /courses/${c.slug} · ${c.level} · ${c.tags.join(", ")}${c.subtitle ? ` · ${c.subtitle}` : ""}`,
    )
    .join("\n");
}

/** Extract readable text from a lesson's blocks for tutor context (§8.1). */
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
