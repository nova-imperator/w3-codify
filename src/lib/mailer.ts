import nodemailer, { type Transporter } from "nodemailer";

/**
 * SMTP email delivery (BUILD_SPEC §11). Configured from SMTP_* env (a Gmail App
 * Password works to start). When SMTP isn't configured we DON'T send — callers
 * fall back to logging the code (dev only).
 */
export function isSmtpConfigured(): boolean {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS && !SMTP_USER.includes("<") && !SMTP_PASS.includes("<"));
}

let transporter: Transporter | null = null;
function getTransport(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: {
        user: (process.env.SMTP_USER ?? "").trim(),
        // Gmail App Passwords are 16 chars; users often paste them with spaces.
        pass: (process.env.SMTP_PASS ?? "").replace(/\s+/g, ""),
      },
    });
  }
  return transporter;
}

function fromAddress(): string {
  return process.env.SMTP_FROM || `W3Codify <${process.env.SMTP_USER}>`;
}

/** Send the branded 6-digit OTP email. Returns true if SMTP accepted it. */
export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  if (!isSmtpConfigured()) return false;
  await getTransport().sendMail({
    from: fromAddress(),
    to,
    subject: `${code} is your W3Codify sign-in code`,
    text: `Your W3Codify sign-in code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    html: otpHtml(code),
  });
  return true;
}

/** Clean, dark, on-brand OTP email (inline styles — email clients ignore <style>). */
function otpHtml(code: string): string {
  const spaced = code.split("").join(" ");
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0a0b14;padding:32px 0;font-family:Arial,Helvetica,sans-serif;color:#edeef7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="440" cellpadding="0" cellspacing="0"
          style="width:440px;max-width:92%;background:#11131f;border:1px solid #23253a;border-radius:18px;overflow:hidden;">
          <tr><td style="padding:28px 32px 8px;">
            <span style="font-size:20px;font-weight:800;color:#edeef7;">W3<span style="color:#8b7dff;">Codify</span></span>
          </td></tr>
          <tr><td style="padding:8px 32px 0;">
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#edeef7;">Your sign-in code</h1>
            <p style="margin:8px 0 0;font-size:14px;line-height:22px;color:#9aa0c0;">
              Enter this code to sign in. It expires in <strong style="color:#edeef7;">10 minutes</strong>.
            </p>
          </td></tr>
          <tr><td style="padding:24px 32px;">
            <div style="background:linear-gradient(135deg,#6d5ef6,#22d3ee);border-radius:14px;padding:2px;">
              <div style="background:#0d0f1b;border-radius:12px;padding:18px 0;text-align:center;">
                <span style="font-size:34px;font-weight:800;letter-spacing:10px;color:#ffffff;">${spaced}</span>
              </div>
            </div>
          </td></tr>
          <tr><td style="padding:0 32px 28px;">
            <p style="margin:0;font-size:12px;line-height:20px;color:#7a80a8;">
              Didn't try to sign in? You can safely ignore this email — no account changes were made.
            </p>
          </td></tr>
        </table>
        <p style="margin:18px 0 0;font-size:11px;color:#5b6182;">© W3Codify · Learn. Build. Get Placed.</p>
      </td></tr>
    </table>
  </body>
</html>`;
}
