import { prisma } from "@/lib/prisma";
import {
  generateOtp,
  hashOtp,
  safeEqualHex,
  OTP_TTL_MS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
} from "@/lib/otp";
import { sendOtpEmail, isSmtpConfigured } from "@/lib/mailer";

export type SendOtpResult =
  | { ok: true; delivered: boolean; devCode?: string }
  | { ok: false; error: string; retryAfterMs?: number };

/** Create + email a 6-digit OTP for an email, with a resend cooldown (§11). */
export async function sendEmailOtp(email: string): Promise<SendOtpResult> {
  const recent = await prisma.otpRequest.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const since = Date.now() - recent.createdAt.getTime();
    if (since < OTP_RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        error: "Please wait before requesting another code.",
        retryAfterMs: OTP_RESEND_COOLDOWN_MS - since,
      };
    }
  }

  const code = generateOtp();
  // Single active request per email.
  await prisma.otpRequest.deleteMany({ where: { email } });
  await prisma.otpRequest.create({
    data: {
      email,
      codeHash: hashOtp(email, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  // Send via SMTP. If SMTP isn't configured (dev only), surface the code so the
  // flow is testable. Never returned/logged once SMTP is set (production).
  if (!isSmtpConfigured()) {
    console.log(`[otp:dev] ${email} -> ${code}`);
    return { ok: true, delivered: false, devCode: code };
  }
  try {
    await sendOtpEmail(email, code);
    return { ok: true, delivered: true };
  } catch (err) {
    console.error("[otp] email send failed:", String(err).slice(0, 200));
    return { ok: false, error: "Couldn't send the email right now. Please try again." };
  }
}

export type VerifyOtpResult = { ok: true } | { ok: false; error: string };

/** Verify a code for an email; consumes on success, counts attempts on failure. */
export async function verifyEmailOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const req = await prisma.otpRequest.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  if (!req) return { ok: false, error: "No code requested. Send one first." };
  if (req.expiresAt.getTime() < Date.now()) {
    await prisma.otpRequest.deleteMany({ where: { email } });
    return { ok: false, error: "Code expired. Please request a new one." };
  }
  if (req.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.otpRequest.deleteMany({ where: { email } });
    return { ok: false, error: "Too many attempts. Request a new code." };
  }
  if (!safeEqualHex(req.codeHash, hashOtp(email, code))) {
    await prisma.otpRequest.update({ where: { id: req.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, error: "Incorrect code. Try again." };
  }
  await prisma.otpRequest.deleteMany({ where: { email } });
  return { ok: true };
}
