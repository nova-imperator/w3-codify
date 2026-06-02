import { prisma } from "@/lib/prisma";
import {
  generateOtp,
  hashOtp,
  safeEqualHex,
  OTP_TTL_MS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
} from "@/lib/otp";
import { sendOtpSms, isMsg91Configured } from "@/lib/msg91";

export type SendOtpResult =
  | { ok: true; delivered: boolean; devCode?: string }
  | { ok: false; error: string; retryAfterMs?: number };

/** Create + (try to) send an OTP for a phone, with resend cooldown. */
export async function sendOtp(phone: string): Promise<SendOtpResult> {
  const recent = await prisma.otpRequest.findFirst({
    where: { phone },
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
  // Single active request per phone.
  await prisma.otpRequest.deleteMany({ where: { phone } });
  await prisma.otpRequest.create({
    data: {
      phone,
      codeHash: hashOtp(phone, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  const { delivered } = await sendOtpSms(phone, code);

  // Dev delivery: when SMS isn't configured, surface the code so the flow
  // is testable (logged + returned). Never do this once MSG91 is set up.
  if (!delivered && !isMsg91Configured()) {
    console.log(`[otp:dev] ${phone} -> ${code}`);
    return { ok: true, delivered: false, devCode: code };
  }
  return { ok: true, delivered };
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; error: string };

/** Verify a code; consumes the request on success, counts attempts on failure. */
export async function verifyOtp(
  phone: string,
  code: string,
): Promise<VerifyOtpResult> {
  const req = await prisma.otpRequest.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
  if (!req) return { ok: false, error: "No code requested. Send one first." };
  if (req.expiresAt.getTime() < Date.now()) {
    await prisma.otpRequest.deleteMany({ where: { phone } });
    return { ok: false, error: "Code expired. Please request a new one." };
  }
  if (req.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.otpRequest.deleteMany({ where: { phone } });
    return { ok: false, error: "Too many attempts. Request a new code." };
  }
  if (!safeEqualHex(req.codeHash, hashOtp(phone, code))) {
    await prisma.otpRequest.update({
      where: { id: req.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "Incorrect code. Try again." };
  }
  await prisma.otpRequest.deleteMany({ where: { phone } });
  return { ok: true };
}
