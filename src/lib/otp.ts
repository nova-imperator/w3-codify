import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes (§11)
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000; // 30s
export const OTP_LENGTH = 6;

/** 6-digit numeric code. */
export function generateOtp(): string {
  return randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");
}

/** HMAC the code with the app secret (codes are never stored in plaintext). */
export function hashOtp(phone: string, code: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update(`${phone}:${code}`).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Normalize to 10-digit Indian number (strip +91 / spaces). */
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").slice(-10);
}

export function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone);
}
