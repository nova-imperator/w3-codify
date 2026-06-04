// Single source of truth for resolving which avatar a user should see.
// Used by every avatar render site (navbar menu, profile sidebar, admin shell)
// so they all behave consistently — keep the resolution order in lock-step with
// `docs/FEATURE_gender-avatar.md`.

export type Gender = "MALE" | "FEMALE" | "UNSPECIFIED";

export type AvatarUser = {
  name?: string | null;
  avatarUrl?: string | null;
  gender?: Gender | null;
};

/**
 * Resolution order:
 *   1. custom upload (`avatarUrl`)            → use it
 *   2. gender MALE                            → /images/gender/male.avif
 *   3. gender FEMALE                          → /images/gender/female.avif
 *   4. otherwise (UNSPECIFIED / unknown)      → null → caller shows initials
 */
export function resolveAvatarUrl(user: AvatarUser): string | null {
  if (user.avatarUrl) return user.avatarUrl;
  if (user.gender === "MALE") return "/images/gender/male.avif";
  if (user.gender === "FEMALE") return "/images/gender/female.avif";
  return null;
}

/** Up-to-2-letter initials for the neutral fallback. */
export function initialsOf(name?: string | null, fallback = "U"): string {
  return (
    (name ?? fallback)
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || fallback
  );
}
