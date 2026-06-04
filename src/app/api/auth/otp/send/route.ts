import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmailOtp } from "@/server/otp";
import { isFeatureEnabled } from "@/server/flags";
import { normalizeEmail, isValidEmail } from "@/lib/otp";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().min(3).max(254) });

// POST /api/auth/otp/send { email } -> emails a 6-digit OTP (§6.4, §11).
// Rate-limited per IP and per email; responses are generic (never reveal whether
// an account exists).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const email = normalizeEmail(parsed.data.email);
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Abuse guards: per-IP (broad) + per-email (narrow).
  const ipRl = rateLimit(`otp:ip:${clientIp(req)}`, 12, 60 * 60_000);
  const emailRl = rateLimit(`otp:email:${email}`, 5, 60 * 60_000);
  if (!ipRl.ok || !emailRl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  // Feature flag: when new sign-ups are paused, existing users can still sign in
  // but a brand-new email can't create an account.
  if (!(await isFeatureEnabled("new_signups"))) {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!existing) {
      return NextResponse.json(
        { error: "New sign-ups are paused right now. Please check back soon." },
        { status: 403 },
      );
    }
  }

  const result = await sendEmailOtp(email);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, retryAfterMs: result.retryAfterMs },
      { status: result.retryAfterMs ? 429 : 500 },
    );
  }
  // devCode is only present when SMTP isn't configured (dev/staging only).
  return NextResponse.json({ ok: true, delivered: result.delivered, devCode: result.devCode });
}
