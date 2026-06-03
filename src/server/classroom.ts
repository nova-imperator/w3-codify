import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { readProgress, completedLessonIds } from "@/server/progress";

/** Enrolled courses + progress for the classroom dashboard (§6.8). */
export async function getMyClassroom() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        include: {
          instructors: { select: { name: true } },
          sections: { include: { lessons: { select: { id: true } } } },
        },
      },
    },
  });

  return enrollments.map((e) => {
    const lessonIds = e.course.sections.flatMap((s) => s.lessons.map((l) => l.id));
    const done = completedLessonIds(e.progress);
    const completed = lessonIds.filter((id) => done.has(id)).length;
    return {
      courseId: e.course.id,
      slug: e.course.slug,
      title: e.course.title,
      thumbnail: e.course.thumbnail,
      isLive: e.course.isLive,
      instructor: e.course.instructors[0]?.name ?? "W3Codify",
      type: e.type,
      totalLessons: lessonIds.length,
      completedLessons: completed,
      percent: lessonIds.length ? Math.round((completed / lessonIds.length) * 100) : 0,
    };
  });
}

/** Full course player payload — only for enrolled users (or admins). */
export async function getCoursePlayer(courseId: string) {
  const user = await getCurrentUser();
  if (!user) return { status: "unauthed" as const };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  if (!enrollment && user.role !== "ADMIN") {
    return { status: "not-enrolled" as const };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructors: { select: { name: true, role: true } },
      assessments: { orderBy: { order: "asc" } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { blocks: { orderBy: { order: "asc" }, include: { media: true } } },
          },
        },
      },
    },
  });
  if (!course) return { status: "not-found" as const };

  // Latest saved code per CODE_EXERCISE (resume where the student left off).
  const exerciseIds = course.sections.flatMap((s) =>
    s.lessons.flatMap((l) => l.blocks.filter((b) => b.type === "CODE_EXERCISE").map((b) => b.id)),
  );
  const subs = exerciseIds.length
    ? await prisma.codeSubmission.findMany({ where: { userId: user.id, exerciseId: { in: exerciseIds } } })
    : [];
  const submissions: Record<string, { code: string; passed: boolean }> = {};
  for (const s of subs) submissions[s.exerciseId] = { code: s.code, passed: s.passed };

  return {
    status: "ok" as const,
    course,
    progress: readProgress(enrollment?.progress),
    submissions,
  };
}
