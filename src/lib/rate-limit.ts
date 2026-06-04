/**
 * Tiny in-process sliding-window rate limiter (BUILD_SPEC §8, §11).
 * Good enough for a single PM2 instance; swap for Upstash/Redis when scaling out.
 */
import { getClientIp } from "@/lib/ip";

const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    const retryAfterMs = windowMs - (now - arr[0]);
    hits.set(key, arr);
    return { ok: false, retryAfterMs };
  }
  arr.push(now);
  hits.set(key, arr);
  return { ok: true, retryAfterMs: 0 };
}

export function clientIp(req: Request): string {
  return getClientIp(req.headers) || "unknown";
}

// Occasionally drop stale buckets so the map doesn't grow unbounded.
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [k, v] of hits) {
        const fresh = v.filter((t) => now - t < 3_600_000);
        if (fresh.length === 0) hits.delete(k);
        else hits.set(k, fresh);
      }
    },
    10 * 60_000,
  ).unref?.();
}
