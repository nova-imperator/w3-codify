import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

function progressMap(progress: unknown): Record<string, boolean> {
  return progress && typeof progress === "object"
    ? (progress as Record<string, boolean>)
    : {};
}

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
    const done = progressMap(e.progress);
    const completed = lessonIds.filter((id) => done[id]).length;
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
    progress: progressMap(enrollment?.progress),
  };
}
