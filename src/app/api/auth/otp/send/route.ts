import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOtp } from "@/server/otp";
import { normalizePhone, isValidPhone } from "@/lib/otp";

const schema = z.object({ phone: z.string().min(8).max(20) });

// POST /api/auth/otp/send { phone } -> sends OTP (rate-limited) (§9).
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }
  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Enter a valid 10-digit number." }, { status: 400 });
  }

  const result = await sendOtp(phone);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, retryAfterMs: result.retryAfterMs },
      { status: 429 },
    );
  }
  // devCode is only present when SMS isn't configured (dev/staging).
  return NextResponse.json({ ok: true, delivered: result.delivered, devCode: result.devCode });
}
