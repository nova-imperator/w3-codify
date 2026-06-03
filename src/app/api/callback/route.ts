import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { normalizePhone, isValidPhone } from "@/lib/otp";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().min(8).max(20),
  enquiryFor: z.string().trim().max(60).default("Online Course (Website)"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  captcha: z.string().optional(),
});

// POST /api/callback — stores a lead (admin kanban) (§6.6, §9).
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
  const { name, enquiryFor, message, captcha } = parsed.data;
  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Enter a valid 10-digit number." }, { status: 400 });
  }
  if (!(await verifyRecaptcha(captcha))) {
    return NextResponse.json({ error: "Captcha verification failed." }, { status: 400 });
  }

  await prisma.callbackLead.create({
    data: { name, phone, enquiryFor, message: message || null, status: "new" },
  });
  // Ops notify (email/WhatsApp) wires up when SES/MSG91 are configured.

  return NextResponse.json({ ok: true });
}
