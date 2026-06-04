import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PUBLIC_FLAGS, type PublicFlags } from "@/lib/flags-shared";

export { DEFAULT_PUBLIC_FLAGS, type PublicFlags };

/**
 * Feature-flag service (feature-flags feature).
 *
 * Every flag has a sensible code **default** here; a `FeatureFlag` row in the DB
 * overrides it. Reads go through `unstable_cache` (tagged + 30s revalidate) so
 * gating a page/route never costs a per-request DB query and marketing pages
 * stay statically renderable. Toggling in /admin busts the tag for an immediate
 * effect (and `setFlag` also revalidates the layout so maintenance flips fast).
 */

export type FlagKey =
  | "maintenance_mode"
  | "new_signups"
  | "paid_pricing"
  | "ai_tutor"
  | "chatbot"
  | "code_playground"
  | "course_reviews";

type FlagDef = { default: boolean; label: string; description: string };

export const FLAG_DEFS: Record<FlagKey, FlagDef> = {
  maintenance_mode: {
    default: false,
    label: "Maintenance mode",
    description: "Show a friendly maintenance page to everyone except admins.",
  },
  new_signups: {
    default: true,
    label: "New sign-ups",
    description: "Allow new accounts to be created at sign-in. Existing users always sign in.",
  },
  paid_pricing: {
    default: false,
    label: "Paid pricing",
    description: "Show real prices and checkout. When off, every course is FREE (launch offer).",
  },
  ai_tutor: {
    default: true,
    label: "AI tutor",
    description: "Show the context-aware AI tutor inside lessons.",
  },
  chatbot: {
    default: true,
    label: "Site chatbot",
    description: "Show the floating site assistant on every page.",
  },
  code_playground: {
    default: true,
    label: "Code playground",
    description: "Show /playground and the in-lesson runnable code exercises.",
  },
  course_reviews: {
    default: false,
    label: "Course reviews",
    description: "Reserved for a future student reviews feature.",
  },
};

export const FLAG_KEYS = Object.keys(FLAG_DEFS) as FlagKey[];
export const FLAGS_TAG = "feature-flags";

/** Raw DB state, cached. Returns {} if the table doesn't exist yet (pre-migrate). */
const loadFlagState = unstable_cache(
  async (): Promise<Record<string, boolean>> => {
    try {
      const rows = await prisma.featureFlag.findMany({ select: { key: true, enabled: true } });
      return Object.fromEntries(rows.map((r) => [r.key, r.enabled]));
    } catch {
      // Table missing or DB unreachable (e.g. during build) — fall back to defaults.
      return {};
    }
  },
  ["feature-flags"],
  { tags: [FLAGS_TAG], revalidate: 30 },
);

/** Every flag resolved to a boolean (DB row or code default). */
export async function getFlags(): Promise<Record<FlagKey, boolean>> {
  const state = await loadFlagState();
  const out = {} as Record<FlagKey, boolean>;
  for (const key of FLAG_KEYS) out[key] = state[key] ?? FLAG_DEFS[key].default;
  return out;
}

export async function isFeatureEnabled(key: FlagKey): Promise<boolean> {
  const state = await loadFlagState();
  return state[key] ?? FLAG_DEFS[key].default;
}

export async function getPublicFlags(): Promise<PublicFlags> {
  const f = await getFlags();
  return {
    ai_tutor: f.ai_tutor,
    chatbot: f.chatbot,
    code_playground: f.code_playground,
    paid_pricing: f.paid_pricing,
    course_reviews: f.course_reviews,
  };
}

/**
 * Persist a flag and invalidate the read cache. Call from a Server Action /
 * Route Handler only (uses revalidateTag). Audit logging is the caller's job.
 */
export async function setFlag(key: FlagKey, enabled: boolean): Promise<void> {
  await prisma.featureFlag.upsert({
    where: { key },
    create: { key, enabled, description: FLAG_DEFS[key].description },
    update: { enabled, description: FLAG_DEFS[key].description },
  });
  revalidateTag(FLAGS_TAG);
}

/** Idempotent seed of every known flag at its default (never clobbers `enabled`). */
export async function seedFlags(): Promise<void> {
  for (const key of FLAG_KEYS) {
    await prisma.featureFlag.upsert({
      where: { key },
      create: { key, enabled: FLAG_DEFS[key].default, description: FLAG_DEFS[key].description },
      update: { description: FLAG_DEFS[key].description },
    });
  }
}
