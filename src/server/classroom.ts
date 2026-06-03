import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type LessonProgress = { completed?: boolean; videoDone?: boolean; score?: { correct: number; total: number } };
type Progress = {
  lessons?: Record<string, LessonProgress>;
  assessments?: Record<string, { score: number; total: number; passed: boolean; at: string }>;
  certificate?: { at: string; scorePct: number } | null;
};

function readProgress(progress: unknown): Progress {
  return progress && typeof progress === "object" ? (progress as Progress) : {};
}

/** Completed lesson ids — supports the new {lessons:{id:{completed}}} shape and legacy {id:true}. */
function completedLessonIds(progress: unknown): Set<string> {
  const p = readProgress(progress);
  const ids = new Set<string>();
  if (p.lessons) {
    for (const [id, lp] of Object.entries(p.lessons)) if (lp?.completed) ids.add(id);
  }
  // legacy flat shape
  for (const [k, v] of Object.entries(progress && typeof progress === "object" ? progress : {})) {
    if (k !== "lessons" && k !== "assessments" && k !== "certificate" && v === true) ids.add(k);
  }
  return ids;
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

  return {
    status: "ok" as const,
    course,
    progress: readProgress(enrollment?.progress),
  };
}
