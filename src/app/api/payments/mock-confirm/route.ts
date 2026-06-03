import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { enrollUser } from "@/server/enroll";

const schema = z.object({ courseId: z.string().min(1) });

// POST /api/payments/mock-confirm -> test-mode enrollment when Razorpay isn't
// configured. Disabled the moment real keys are present (forces the real flow).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (isRazorpayConfigured()) {
    return NextResponse.json({ error: "Use the real checkout." }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const course = await prisma.course.findFirst({
    where: { id: parsed.data.courseId, status: "PUBLISHED" },
    select: { id: true, priceInr: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  await enrollUser(user.id, course.id, "PAID", `mock_${Date.now()}`);
  return NextResponse.json({ ok: true, mock: true });
}
