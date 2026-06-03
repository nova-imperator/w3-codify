import { prisma } from "@/lib/prisma";
import type { EnrollType } from "@prisma/client";

export async function getEnrolledCourseIds(userId: string): Promise<string[]> {
  const rows = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });
  return rows.map((r) => r.courseId);
}

export async function enrollUser(
  userId: string,
  courseId: string,
  type: EnrollType,
  paymentId?: string,
) {
  return prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { status: "ACTIVE", ...(paymentId ? { paymentId, type } : {}) },
    create: { userId, courseId, type, paymentId: paymentId ?? null },
  });
}
