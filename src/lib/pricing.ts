/**
 * Launch pricing (Session 5). All courses are FREE for now: a course with
 * priceInr === 0 is the launch offer and shows a struck ₹10,000 anchor + FREE
 * + a "Launch Offer" badge. The moment an admin sets a real price (> 0), that
 * course becomes paid again and the Razorpay checkout re-activates (the free
 * vs. paid logic from Session 4 is unchanged) — no code edit required.
 */
export const LAUNCH_ANCHOR_INR = 10000;
export const LAUNCH_LABEL = "Launch Offer · 100% OFF · Limited Time";

export type CoursePricing = {
  free: boolean;
  /** Struck-through anchor to show next to FREE (₹10,000), or the MRP for paid. */
  anchorInr: number;
  launchOffer: boolean;
};

export function pricingFor(priceInr: number, mrpInr = 0): CoursePricing {
  if (priceInr === 0) {
    return { free: true, anchorInr: LAUNCH_ANCHOR_INR, launchOffer: true };
  }
  return { free: false, anchorInr: mrpInr, launchOffer: false };
}
