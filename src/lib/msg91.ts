/**
 * MSG91 SMS/OTP delivery (BUILD_SPEC §3, §11).
 * When MSG91 isn't configured (no auth key), delivery is a no-op and the
 * caller falls back to "dev delivery" (surfacing the code) so the flow stays
 * testable without an SMS provider.
 */
export const isMsg91Configured = () => !!process.env.MSG91_AUTH_KEY;

export async function sendOtpSms(
  phone: string,
  code: string,
): Promise<{ delivered: boolean }> {
  if (!isMsg91Configured()) return { delivered: false };

  try {
    const res = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY as string,
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_OTP_TEMPLATE_ID,
        mobile: `91${phone}`,
        otp: code,
        sender: process.env.MSG91_SENDER_ID,
      }),
    });
    return { delivered: res.ok };
  } catch {
    return { delivered: false };
  }
}
