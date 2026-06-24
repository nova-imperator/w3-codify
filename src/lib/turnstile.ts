/**
 * Cloudflare Turnstile server-side verification (login bot protection).
 * Skips (allows) when not configured so dev/staging works without keys —
 * mirrors the reCAPTCHA helper. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY (public,
 * used by the widget) + TURNSTILE_SECRET_KEY (server) to enforce.
 */
export const isTurnstileConfigured = () =>
  !!process.env.TURNSTILE_SECRET_KEY && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string,
): Promise<boolean> {
  if (!isTurnstileConfigured()) return true; // not enforced when unconfigured
  if (!token) return false;
  try {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY as string,
      response: token,
    });
    if (remoteIp) body.set("remoteip", remoteIp);
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
