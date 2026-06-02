import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/session";

export async function getAdminStats() {
  await requireAdmin();
  const [students, enrollments, courses, leads, publishedCourses, paidEnrollments] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.enrollment.count(),
      prisma.course.count(),
      prisma.callbackLead.count({ where: { status: "new" } }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.enrollment.findMany({
        where: { type: "PAID" },
        include: { course: { select: { priceInr: true } } },
      }),
    ]);

  const revenue = paidEnrollments.reduce((sum, e) => sum + (e.course?.priceInr ?? 0), 0);

  // Enrollments over the last 6 months for the chart.
  const all = await prisma.enrollment.findMany({ select: { createdAt: true } });
  const months: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    const value = all.filter(
      (e) =>
        e.createdAt.getFullYear() === d.getFullYear() &&
        e.createdAt.getMonth() === d.getMonth(),
    ).length;
    months.push({ label, value });
  }

  const recentLeads = await prisma.callbackLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    students,
    enrollments,
    courses,
    publishedCourses,
    leads,
    revenue,
    months,
    recentLeads,
  };
}

export async function getAdminCourses() {
  await requireAdmin();
  return prisma.course.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      instructors: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, sections: true } },
    },
  });
}

export async function getAdminCourse(id: string) {
  await requireAdmin();
  return prisma.course.findUnique({
    where: { id },
    include: {
      instructors: true,
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
}

export async function getAdminInstructors() {
  await requireAdmin();
  return prisma.instructor.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });
}

export async function getAdminStudents(q?: string) {
  await requireAdmin();
  return prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true } },
      enrollments: { include: { course: { select: { title: true } } } },
    },
    take: 200,
  });
}

export async function getAdminLeads() {
  await requireAdmin();
  return prisma.callbackLead.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminMedia() {
  await requireAdmin();
  return prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { blocks: true } } },
  });
}
