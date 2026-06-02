import { z } from "zod";

/** Shared Zod schemas (FE + BE). BUILD_SPEC §9, §14. */

export const coursesQuerySchema = z.object({
  tag: z.string().trim().min(1).max(50).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  q: z.string().trim().max(100).optional(),
});

export type CoursesQuery = z.infer<typeof coursesQuerySchema>;
