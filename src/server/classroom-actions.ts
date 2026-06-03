"use server";

import { prisma } from "@/lib/prisma";
import {
  type LessonProgress,
  loadEnrollment,
  readProgress,
  recompute,
  persistProgress as persist,
} from "@/server/progress";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export type LessonState = {
  completed: boolean;
  videoDone: boolean;
  score: { correct: number; total: number };
};

function toState(lp: LessonProgress): LessonState {
  return {
    completed: !!lp.completed,
    videoDone: !!lp.videoDone,
    score: lp.score ?? { correct: 0, total: 0 },
  };
}

/** Record a quiz checkpoint answer; updates per-lesson knowledge score + completion. */
export async function recordQuiz(
  courseId: string,
  lessonId: string,
  blockId: string,
  picked: number,
  correct: boolean,
): Promise<ActionResult<LessonState>> {
  try {
    const e = await loadEnrollment(courseId);
    if (!e) return { ok: false, error: "You're not enrolled in this course." };
    const progress = readProgress(e.progress);
    progress.lessons ??= {};
    const lp = progress.lessons[lessonId] ?? {};
    lp.quiz = { ...(lp.quiz ?? {}), [blockId]: { picked, correct } };
    const updated = await recompute(lessonId, lp);
    progress.lessons[lessonId] = updated;
    await persist(e.id, progress);
    return { ok: true, data: toState(updated) };
  } catch {
    return { ok: false, error: "Couldn't save your answer. Try again." };
  }
}

/** Mark the lesson's video as watched (a gate toward completion). */
export async function markVideoWatched(
  courseId: string,
  lessonId: string,
  done = true,
): Promise<ActionResult<LessonState>> {
  try {
    const e = await loadEnrollment(courseId);
    if (!e) return { ok: false, error: "You're not enrolled in this course." };
    const progress = readProgress(e.progress);
    progress.lessons ??= {};
    const lp = progress.lessons[lessonId] ?? {};
    lp.videoDone = done;
    const updated = await recompute(lessonId, lp);
    progress.lessons[lessonId] = updated;
    await persist(e.id, progress);
    return { ok: true, data: toState(updated) };
  } catch {
    return { ok: false, error: "Something went wrong. Try again." };
  }
}

/** Fallback completion for a lesson with no video and no quiz (text/doc only). */
export async function markLessonDone(courseId: string, lessonId: string): Promise<ActionResult> {
  try {
    const e = await loadEnrollment(courseId);
    if (!e) return { ok: false, error: "Not enrolled." };
    const progress = readProgress(e.progress);
    progress.lessons ??= {};
    progress.lessons[lessonId] = { ...(progress.lessons[lessonId] ?? {}), completed: true };
    await persist(e.id, progress);
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong." };
  }
}

export type AssessmentResult = {
  score: number;
  total: number;
  pct: number;
  passed: boolean;
  certificate: boolean;
};

/** Grade a tier mini-assessment or the final assessment; a final pass issues the certificate. */
export async function submitAssessment(
  courseId: string,
  assessmentId: string,
  answers: number[],
): Promise<ActionResult<AssessmentResult>> {
  try {
    const e = await loadEnrollment(courseId);
    if (!e) return { ok: false, error: "You're not enrolled in this course." };
    const assessment = await prisma.assessment.findFirst({ where: { id: assessmentId, courseId } });
    if (!assessment) return { ok: false, error: "Assessment not found." };

    const questions = (assessment.questions as { answer: number }[]) ?? [];
    const total = questions.length;
    const score = questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
    const pct = total ? Math.round((score / total) * 100) : 0;
    const passed = pct >= assessment.passPct;

    const progress = readProgress(e.progress);
    progress.assessments ??= {};
    progress.assessments[assessmentId] = { score, total, passed, at: new Date().toISOString() };

    let certificate = false;
    if (assessment.tier === null && passed) {
      progress.certificate = { at: new Date().toISOString(), scorePct: pct };
      certificate = true;
    }
    await persist(e.id, progress);
    return { ok: true, data: { score, total, pct, passed, certificate } };
  } catch {
    return { ok: false, error: "Couldn't submit. Try again." };
  }
}
