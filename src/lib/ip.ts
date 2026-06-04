/**
 * Client-IP + allowlist helpers (edge-safe — no Node APIs).
 * Behind Cloudflare the real client IP is in `CF-Connecting-IP`; we fall back
 * to `X-Forwarded-For` (first hop) then `X-Real-IP`.
 */
export function getClientIp(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() ?? "";
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const o = Number(p);
    if (!Number.isInteger(o) || o < 0 || o > 255 || !/^\d+$/.test(p)) return null;
    n = (n << 8) | o;
  }
  return n >>> 0;
}

/** Match an IP against a single entry — IPv4 CIDR (a.b.c.d/n), or an exact IP (v4/v6). */
function matchEntry(ip: string, entry: string): boolean {
  if (entry === ip) return true;
  const slash = entry.indexOf("/");
  if (slash === -1) return false; // plain IP, already compared above
  const range = entry.slice(0, slash);
  const bits = Number(entry.slice(slash + 1));
  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(range);
  if (ipInt === null || rangeInt === null || !Number.isInteger(bits) || bits < 0 || bits > 32) {
    return false; // non-IPv4 CIDR (e.g. IPv6) — exact match only, handled above
  }
  if (bits === 0) return true;
  const mask = bits === 32 ? 0xffffffff : (~((1 << (32 - bits)) - 1)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

/** True if `ip` is allowed by the comma-separated CIDR/IP allowlist. */
export function isIpAllowed(ip: string, allowlist: string): boolean {
  const entries = allowlist
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (entries.length === 0) return true; // empty allowlist = no restriction
  if (!ip) return false; // can't identify the client → deny when allowlist is active
  return entries.some((e) => matchEntry(ip, e));
}
