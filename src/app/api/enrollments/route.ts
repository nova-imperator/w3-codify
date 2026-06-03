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

// POST /api/enrollments { courseId } -> enroll in a FREE course (§9).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const course = await prisma.course.findFirst({
    where: { id: parsed.data.courseId, status: "PUBLISHED" },
    select: { id: true, priceInr: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  if (course.priceInr > 0) {
    return NextResponse.json({ error: "This course requires payment." }, { status: 402 });
  }

  await enrollUser(user.id, course.id, "FREE");
  return NextResponse.json({ ok: true });
}
