"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/** Mark a lesson complete/incomplete; persisted in Enrollment.progress JSON. */
export async function setLessonComplete(
  courseId: string,
  lessonId: string,
  done: boolean,
): Promise<ActionResult<{ percent: number; completed: number; total: number }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Please sign in." };

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (!enrollment) return { ok: false, error: "You're not enrolled in this course." };

    const progress =
      enrollment.progress && typeof enrollment.progress === "object"
        ? { ...(enrollment.progress as Record<string, boolean>) }
        : {};
    if (done) progress[lessonId] = true;
    else delete progress[lessonId];

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress },
    });

    // Recompute percent for the client.
    const lessons = await prisma.lesson.findMany({
      where: { section: { courseId } },
      select: { id: true },
    });
    const total = lessons.length;
    const completed = lessons.filter((l) => progress[l.id]).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    // Mark enrollment complete when all lessons are done.
    if (total > 0 && completed === total && enrollment.status !== "COMPLETED") {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED" },
      });
    }

    return { ok: true, data: { percent, completed, total } };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
