import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { readProgress } from "@/server/progress";
import { computeProgress } from "@/server/learning";

/** Enrolled courses + progress for the classroom dashboard (§6.8). */
export async function getMyClassroom() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructors: { select: { name: true } },
          sections: { select: { order: true, lessons: { select: { id: true, order: true } } } },
        },
      },
    },
  });

  return enrollments
    .map((e) => {
      const lessonIds = [...e.course.sections]
        .sort((a, b) => a.order - b.order)
        .flatMap((s) => [...s.lessons].sort((a, b) => a.order - b.order).map((l) => l.id));
      const p = computeProgress(e.progress, lessonIds, e.lastLessonId);
      return {
        courseId: e.course.id,
        slug: e.course.slug,
        title: e.course.title,
        thumbnail: e.course.thumbnail,
        isLive: e.course.isLive,
        instructor: e.course.instructors[0]?.name ?? "W3Codify",
        type: e.type,
        totalLessons: p.total,
        completedLessons: p.completed,
        percent: p.percent,
        completedCourse: p.completedCourse,
        resumeLessonId: p.lastLessonId,
        recency: e.lastActiveAt?.getTime() ?? e.createdAt.getTime(),
      };
    })
    .sort((a, b) => b.recency - a.recency);
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

  return {
    status: "ok" as const,
    course,
    progress: readProgress(enrollment?.progress),
  };
}
