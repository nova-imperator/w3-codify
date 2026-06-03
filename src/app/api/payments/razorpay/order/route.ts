import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { isRazorpayConfigured, getRazorpay } from "@/lib/razorpay";

const schema = z.object({ courseId: z.string().min(1) });

// POST /api/payments/razorpay/order { courseId } -> Razorpay order, or
// { mock:true } when no keys are set so the flow stays testable (§9).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const course = await prisma.course.findFirst({
    where: { id: parsed.data.courseId, status: "PUBLISHED" },
    select: { id: true, title: true, priceInr: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  if (course.priceInr <= 0) {
    return NextResponse.json({ error: "This course is free — just enroll." }, { status: 400 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json({ mock: true, courseId: course.id, amount: course.priceInr });
  }

  const order = await getRazorpay().orders.create({
    amount: course.priceInr * 100, // paise
    currency: "INR",
    receipt: `c_${course.id}_${user.id}`.slice(0, 40),
    notes: { courseId: course.id, userId: user.id },
  });

  return NextResponse.json({
    mock: false,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    courseTitle: course.title,
    prefill: { name: user.name ?? "", email: user.email ?? "" },
  });
}
