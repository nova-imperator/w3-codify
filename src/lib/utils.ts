import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, de-duping Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Indian-style number formatting for stats / prices. */
export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compact number (e.g. 600000 -> "600k", 1000000 -> "1M"). */
export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Seconds -> "12h 30m" / "45m" / "0m". */
export function formatDuration(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.round((totalSec % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

/** Discount percent from MRP, or 0. */
export function discountPercent(priceInr: number, mrpInr: number) {
  if (!mrpInr || mrpInr <= priceInr) return 0;
  return Math.round(((mrpInr - priceInr) / mrpInr) * 100);
}
