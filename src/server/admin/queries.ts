import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/session";
import type { Prisma } from "@prisma/client";

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
  // All users (incl. admins) so roles can be managed here; admins first.
  return prisma.user.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {},
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
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

// ─────────────────────────── Audit log (§6.9) ───────────────────────────
const AUDIT_PER_PAGE = 50;

export async function getAuditLog(opts: { page?: number; action?: string; entity?: string } = {}) {
  await requireAdmin();
  const page = Math.max(1, opts.page ?? 1);
  const where: Prisma.AdminAuditLogWhereInput = {};
  if (opts.action) where.action = opts.action;
  if (opts.entity) where.entity = opts.entity;

  const [total, logs, actionGroups, entityGroups] = await Promise.all([
    prisma.adminAuditLog.count({ where }),
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * AUDIT_PER_PAGE,
      take: AUDIT_PER_PAGE,
    }),
    prisma.adminAuditLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
    prisma.adminAuditLog.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } }),
  ]);

  // Resolve actor names (actorId is a plain id, not a relation).
  const actorIds = [...new Set(logs.map((l) => l.actorId))];
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, firstName: true, lastName: true, email: true },
      })
    : [];
  const actorMap = new Map(
    actors.map((a) => [a.id, [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email || a.id]),
  );

  return {
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      meta: l.meta,
      actor: actorMap.get(l.actorId) ?? l.actorId,
      createdAt: l.createdAt.toISOString(),
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / AUDIT_PER_PAGE)),
    actions: actionGroups.map((a) => a.action),
    entities: entityGroups.map((e) => e.entity),
  };
}
