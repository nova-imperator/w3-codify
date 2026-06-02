import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendOtp } from "@/server/otp";
import { normalizePhone, isValidPhone } from "@/lib/otp";
import { verifyRecaptcha } from "@/lib/recaptcha";

const schema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().max(60).optional().default(""),
  phone: z.string().min(8).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  consent: z.boolean().optional().default(true),
  captcha: z.string().optional(),
});

// POST /api/auth/register -> creates user (or reuses unverified), sends OTP (§9).
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your details and try again." },
      { status: 400 },
    );
  }
  const { firstName, lastName, email, consent, captcha } = parsed.data;
  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Enter a valid 10-digit number." }, { status: 400 });
  }

  if (!(await verifyRecaptcha(captcha))) {
    return NextResponse.json({ error: "Captcha verification failed." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing?.phoneVerified) {
    return NextResponse.json(
      { error: "An account with this number already exists. Please sign in." },
      { status: 409 },
    );
  }

  if (email) {
    const emailTaken = await prisma.user.findFirst({
      where: { email, NOT: { phone } },
    });
    if (emailTaken) {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    }
  }

  await prisma.user.upsert({
    where: { phone },
    update: { firstName, lastName: lastName || null, email: email || null, consentComms: consent },
    create: {
      phone,
      firstName,
      lastName: lastName || null,
      email: email || null,
      consentComms: consent,
    },
  });

  const result = await sendOtp(phone);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 429 });
  }
  return NextResponse.json({ ok: true, delivered: result.delivered, devCode: result.devCode });
}
