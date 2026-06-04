"use server";

import { getCurrentUser } from "@/server/session";
import { recordActivity, getContinueLearning, type ContinueCourse } from "@/server/learning";

/**
 * The signed-in student's in-progress courses for the continue-learning banner.
 * Returns [] when signed out — lets a STATIC page render the banner client-side
 * without becoming dynamic.
 */
export async function getMyContinueLearning(): Promise<ContinueCourse[]> {
  const user = await getCurrentUser();
  if (!user?.id) return [];
  try {
    return await getContinueLearning(user.id);
  } catch {
    return [];
  }
}

/**
 * Record that the signed-in student is viewing a lesson — updates the course's
 * resume target + the daily streak. Fire-and-forget from the player.
 */
export async function pingLesson(
  courseId: string,
  lessonId: string,
): Promise<{ ok: true; streak: number } | { ok: false }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false };
  try {
    const { streak } = await recordActivity(user.id, courseId, lessonId);
    return { ok: true, streak };
  } catch {
    return { ok: false };
  }
}
