import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { getEnrolledCourseIds, enrollUser } from "@/server/enroll";

// GET /api/enrollments -> { courseIds } for the signed-in user.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ courseIds: [] });
  return NextResponse.json({ courseIds: await getEnrolledCourseIds(user.id) });
}

const schema = z.object({ courseId: z.string().min(1) });

// POST /api/enrollments { courseId } -> enroll for FREE (§9).
// Everything is free right now (no payment step). Paid checkout / Razorpay
// can return here later if the `paid_pricing` flag is ever turned on.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const course = await prisma.course.findFirst({
    where: { id: parsed.data.courseId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  await enrollUser(user.id, course.id, "FREE");
  return NextResponse.json({ ok: true });
}
