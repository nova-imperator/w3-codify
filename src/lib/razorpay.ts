import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";

/** True when Razorpay keys (test or live) are present and non-placeholder. */
export function isRazorpayConfigured(): boolean {
  const id = process.env.RAZORPAY_KEY_ID ?? "";
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const filled = (v: string) => !!v && !v.includes("<") && !v.includes("FILL_ME");
  return filled(id) && filled(secret);
}

export function isTestMode(): boolean {
  return (process.env.RAZORPAY_KEY_ID ?? "").startsWith("rzp_test_");
}

let client: Razorpay | null = null;
export function getRazorpay(): Razorpay {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }
  return client;
}

/** Verify the checkout signature: HMAC_SHA256(order_id|payment_id, secret). */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
