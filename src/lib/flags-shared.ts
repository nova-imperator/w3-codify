/**
 * Client-safe feature-flag shapes (no DB / server imports). Shared by the
 * server service (src/server/flags.ts) and the client context provider so the
 * browser bundle never pulls in Prisma or next/cache.
 */

/** Client-safe flags (booleans only) exposed to the browser via context. */
export type PublicFlags = {
  ai_tutor: boolean;
  chatbot: boolean;
  code_playground: boolean;
  paid_pricing: boolean;
  course_reviews: boolean;
};

/** Defaults — used as the client context fallback (must match FLAG_DEFS). */
export const DEFAULT_PUBLIC_FLAGS: PublicFlags = {
  ai_tutor: true,
  chatbot: true,
  code_playground: true,
  paid_pricing: false,
  course_reviews: false,
};
