import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

/**
 * Shared enrollment-progress core (§6.8.1). A lesson completes only when its
 * video is watched AND all quiz checkpoints pass; the per-lesson knowledge score
 * counts quiz checkpoints. (The legacy `exercises` field is retained as optional
 * for backward-compat with existing stored progress but no longer gates anything.)
 */
export type LessonProgress = {
  videoDone?: boolean;
  quiz?: Record<string, { picked: number; correct: boolean }>;
  exercises?: Record<string, { passed: boolean; passedCount: number; totalCount: number }>;
  completed?: boolean;
  score?: { correct: number; total: number };
};
export type Progress = {
  lessons?: Record<string, LessonProgress>;
  assessments?: Record<string, { score: number; total: number; passed: boolean; at: string }>;
  certificate?: { at: string; scorePct: number } | null;
};

export function readProgress(raw: unknown): Progress {
  return raw && typeof raw === "object" ? { ...(raw as Progress) } : {};
}

/** Completed lesson ids — new {lessons:{id:{completed}}} shape + legacy {id:true}. */
export function completedLessonIds(raw: unknown): Set<string> {
  const p = readProgress(raw);
  const ids = new Set<string>();
  if (p.lessons) for (const [id, lp] of Object.entries(p.lessons)) if (lp?.completed) ids.add(id);
  for (const [k, v] of Object.entries(raw && typeof raw === "object" ? raw : {})) {
    if (k !== "lessons" && k !== "assessments" && k !== "certificate" && v === true) ids.add(k);
  }
  return ids;
}

export async function loadEnrollment(courseId: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
}

export async function persistProgress(enrollmentId: string, progress: Progress) {
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { progress: progress as object },
  });
}

/** Recompute a lesson's completion + score from its gates: video + quiz checkpoints. */
export async function recompute(lessonId: string, lp: LessonProgress): Promise<LessonProgress> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { blocks: { select: { id: true, type: true, data: true } } },
  });
  if (!lesson) return lp;

  const quizIds = lesson.blocks.filter((b) => b.type === "QUIZ").map((b) => b.id);
  const hasVideo =
    !!lesson.videoUrl ||
    lesson.blocks.some((b) => {
      const d = (b.data as Record<string, unknown>) ?? {};
      return (b.type === "VIDEO" || b.type === "EMBED") && typeof d.url === "string" && !!d.url;
    });

  const quiz = lp.quiz ?? {};
  const quizCorrect = quizIds.filter((id) => quiz[id]?.correct).length;

  const videoOk = !hasVideo || !!lp.videoDone;
  const quizOk = quizIds.length === 0 || quizIds.every((id) => quiz[id]?.correct);
  const gated = hasVideo || quizIds.length > 0;

  return {
    ...lp,
    score: { correct: quizCorrect, total: quizIds.length },
    completed: videoOk && quizOk && gated,
  };
}
