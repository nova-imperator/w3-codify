import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

/**
 * Shared enrollment-progress core (§6.8.1, §6.8.2). A lesson completes only when
 * its video is watched AND all quiz checkpoints pass AND all CODE_EXERCISE blocks
 * pass; the per-lesson knowledge score counts quizzes + exercises.
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

/** Recompute a lesson's completion + score from its gates: video + quizzes + exercises. */
export async function recompute(lessonId: string, lp: LessonProgress): Promise<LessonProgress> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { blocks: { select: { id: true, type: true, data: true } } },
  });
  if (!lesson) return lp;

  const quizIds = lesson.blocks.filter((b) => b.type === "QUIZ").map((b) => b.id);
  const exerciseIds = lesson.blocks.filter((b) => b.type === "CODE_EXERCISE").map((b) => b.id);
  const hasVideo =
    !!lesson.videoUrl ||
    lesson.blocks.some((b) => {
      const d = (b.data as Record<string, unknown>) ?? {};
      return (b.type === "VIDEO" || b.type === "EMBED") && typeof d.url === "string" && !!d.url;
    });

  const quiz = lp.quiz ?? {};
  const exercises = lp.exercises ?? {};
  const quizCorrect = quizIds.filter((id) => quiz[id]?.correct).length;
  const exDone = exerciseIds.filter((id) => exercises[id]?.passed).length;

  const videoOk = !hasVideo || !!lp.videoDone;
  const quizOk = quizIds.length === 0 || quizIds.every((id) => quiz[id]?.correct);
  const exOk = exerciseIds.length === 0 || exerciseIds.every((id) => exercises[id]?.passed);
  const gated = hasVideo || quizIds.length > 0 || exerciseIds.length > 0;

  return {
    ...lp,
    score: { correct: quizCorrect + exDone, total: quizIds.length + exerciseIds.length },
    completed: videoOk && quizOk && exOk && gated,
  };
}
