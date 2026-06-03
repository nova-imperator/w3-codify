import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { isRazorpayConfigured, verifyPaymentSignature } from "@/lib/razorpay";
import { enrollUser } from "@/server/enroll";

const schema = z.object({
  courseId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// POST /api/payments/razorpay/verify -> verify signature, then enroll PAID (§9).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Payments not configured." }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { courseId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  await enrollUser(user.id, course.id, "PAID", razorpay_payment_id);
  return NextResponse.json({ ok: true });
}
