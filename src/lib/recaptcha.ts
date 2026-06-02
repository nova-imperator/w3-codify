/**
 * Google reCAPTCHA v3 server-side verification (BUILD_SPEC §11).
 * Skips (allows) when not configured so dev/staging works without keys.
 */
export const isRecaptchaConfigured = () =>
  !!process.env.RECAPTCHA_SECRET_KEY && !!process.env.RECAPTCHA_SITE_KEY;

const SCORE_THRESHOLD = 0.5;

export async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  if (!isRecaptchaConfigured()) return true; // not enforced when unconfigured
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY as string,
        response: token,
      }),
    });
    const data = (await res.json()) as { success: boolean; score?: number };
    return data.success && (data.score ?? 0) >= SCORE_THRESHOLD;
  } catch {
    return false;
  }
}
