import { z } from "zod";

/** Shared Zod schemas (FE + BE). BUILD_SPEC §9, §14. */

/**
 * Person name: letters (incl. accents), spaces, and basic punctuation
 * (. ' -) only. Length 2–60, trimmed, no leading/trailing space.
 * Used client-side (inline error) AND server-side (defense in depth).
 */
export const NAME_REGEX = /^[\p{L}][\p{L} .'-]*$/u;

export const personNameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your full name (2–60 letters).")
  .max(60, "Name is too long (max 60 characters).")
  .regex(NAME_REGEX, "Use letters, spaces, and . ' - only.");

/** Returns an error message for an invalid name, or null if valid. */
export function validatePersonName(value: string): string | null {
  const res = personNameSchema.safeParse(value);
  return res.success ? null : res.error.issues[0]?.message ?? "Please enter a valid name.";
}

export const coursesQuerySchema = z.object({
  tag: z.string().trim().min(1).max(50).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  q: z.string().trim().max(100).optional(),
});

export type CoursesQuery = z.infer<typeof coursesQuerySchema>;
