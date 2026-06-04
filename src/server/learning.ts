import { prisma } from "@/lib/prisma";
import { completedLessonIds } from "@/server/progress";

/**
 * Learning progress, resume targets, streaks, and the "continue learning" feed
 * (FEATURE_progress-continue). Progress = completed lessons ÷ total lessons.
 */
export type CourseProgress = {
  percent: number;
  completed: number;
  total: number;
  lastLessonId: string | null; // resume target
  completedCourse: boolean;
};

/** Pure progress computation from already-loaded data (no extra query → no N+1). */
export function computeProgress(
  progressJson: unknown,
  lessonIds: string[],
  lastLessonId: string | null,
): CourseProgress {
  const done = completedLessonIds(progressJson);
  const completed = lessonIds.filter((id) => done.has(id)).length;
  const total = lessonIds.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  // Resume: explicit last-viewed → first not-yet-completed → first lesson.
  const resume =
    (lastLessonId && lessonIds.includes(lastLessonId) ? lastLessonId : null) ??
    lessonIds.find((id) => !done.has(id)) ??
    lessonIds[0] ??
    null;
  return { percent, completed, total, lastLessonId: resume, completedCourse: total > 0 && completed === total };
}

/** Progress for one course (server helper named in the spec). */
export async function courseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: { course: { include: { sections: { include: { lessons: { select: { id: true, order: true } } } } } } },
  });
  if (!enrollment) return null;
  const lessonIds = orderedLessonIds(enrollment.course.sections);
  return computeProgress(enrollment.progress, lessonIds, enrollment.lastLessonId);
}

type SectionLite = { order: number; lessons: { id: string; order: number }[] };
function orderedLessonIds(sections: { order: number; lessons: { id: string; order: number }[] }[]): string[] {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .flatMap((s) => [...s.lessons].sort((a, b) => a.order - b.order).map((l) => l.id));
}

export type ContinueCourse = {
  courseId: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  percent: number;
  completed: number;
  total: number;
  resumeLessonId: string | null;
  lastActiveAt: string | null;
};

/**
 * In-progress courses (0% < progress < 100%) for the continue-learning banner,
 * most-recently-active first. One DB round-trip.
 */
export async function getContinueLearning(userId: string): Promise<ContinueCourse[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          thumbnail: true,
          sections: { select: { order: true, lessons: { select: { id: true, order: true } } } },
        },
      },
    },
  });

  const rows = enrollments
    .map((e) => {
      const lessonIds = orderedLessonIds(e.course.sections as SectionLite[]);
      const p = computeProgress(e.progress, lessonIds, e.lastLessonId);
      return {
        courseId: e.course.id,
        slug: e.course.slug,
        title: e.course.title,
        thumbnail: e.course.thumbnail,
        percent: p.percent,
        completed: p.completed,
        total: p.total,
        resumeLessonId: p.lastLessonId,
        lastActiveAt: e.lastActiveAt ? e.lastActiveAt.toISOString() : null,
        _recency: e.lastActiveAt?.getTime() ?? e.createdAt.getTime(),
      };
    })
    .filter((r) => r.percent > 0 && r.percent < 100)
    .sort((a, b) => b._recency - a._recency)
    .map(({ _recency, ...r }) => r); // eslint-disable-line @typescript-eslint/no-unused-vars

  return rows;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Record lesson activity: remember the last-viewed lesson + bump the daily
 * streak. Idempotent within a day. Returns the current streak.
 */
export async function recordActivity(
  userId: string,
  courseId: string,
  lessonId: string,
): Promise<{ streak: number }> {
  const now = new Date();

  // Enrollment recency + resume target (only if the user is enrolled).
  await prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: { lastLessonId: lessonId, lastActiveAt: now },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastActiveDate: true },
  });
  if (!user) return { streak: 0 };

  const today = startOfDay(now);
  const last = user.lastActiveDate ? startOfDay(user.lastActiveDate) : null;
  let streak = user.streak || 0;

  if (last === today) {
    return { streak }; // already counted today — no write
  }
  if (last !== null && today - last === 86_400_000) streak += 1; // consecutive day
  else streak = 1; // first ever, or a gap

  await prisma.user.update({
    where: { id: userId },
    data: { streak, lastActiveDate: new Date(today) },
  });
  return { streak };
}

/** Current streak for display; resets to 0 if the last activity was before yesterday. */
export async function getStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastActiveDate: true },
  });
  if (!user || !user.lastActiveDate) return 0;
  const today = startOfDay(new Date());
  const last = startOfDay(user.lastActiveDate);
  const gapDays = Math.round((today - last) / 86_400_000);
  return gapDays <= 1 ? user.streak : 0; // active today or yesterday keeps the streak alive
}
