import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { runCode, gradeExercise, isLanguage, type TestCase, type Language } from "@/server/runner";
import {
  loadEnrollment,
  readProgress,
  recompute,
  persistProgress,
} from "@/server/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const runSchema = z.object({
  mode: z.literal("run"),
  language: z.string(),
  source: z.string().max(50_000),
  stdin: z.string().max(20_000).optional(),
});

const gradeSchema = z.object({
  mode: z.literal("grade"),
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  blockId: z.string().min(1),
  source: z.string().max(50_000),
});

// POST /api/run — sandboxed execution (§6.8.2). mode "run" (free scratchpad/playground,
// public) or "grade" (auth + enrolled: runs hidden tests server-side, persists submission
// + feeds lesson completion/score). Untrusted code never executes in this process.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mode = body?.mode;

  // ── Free run (playground + exercise "Run") ──
  if (mode === "run") {
    const parsed = runSchema.safeParse(body);
    if (!parsed.success || !isLanguage(parsed.data.language)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const user = await getCurrentUser();
    const key = user ? `run:u:${user.id}` : `run:ip:${clientIp(req)}`;
    const rl = rateLimit(key, user ? 40 : 15, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: user ? "Slow down a moment — too many runs." : "Run limit reached. Sign in (free) to keep running code." },
        { status: 429 },
      );
    }
    const result = await runCode({
      language: parsed.data.language,
      source: parsed.data.source,
      stdin: parsed.data.stdin ?? "",
    });
    return NextResponse.json({ result });
  }

  // ── Graded submission (in-lesson exercise) ──
  if (mode === "grade") {
    const parsed = gradeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

    const rl = rateLimit(`grade:${user.id}`, 30, 60_000);
    if (!rl.ok) return NextResponse.json({ error: "Slow down a moment." }, { status: 429 });

    const enrollment = await loadEnrollment(parsed.data.courseId);
    if (!enrollment) return NextResponse.json({ error: "You're not enrolled in this course." }, { status: 403 });

    // Load the exercise's FULL data server-side (hidden tests + solution never reach the client).
    const block = await prisma.lessonBlock.findFirst({
      where: { id: parsed.data.blockId, lessonId: parsed.data.lessonId, type: "CODE_EXERCISE" },
    });
    if (!block) return NextResponse.json({ error: "Exercise not found." }, { status: 404 });

    const d = (block.data as Record<string, unknown>) ?? {};
    const language = (typeof d.language === "string" && isLanguage(d.language) ? d.language : "python") as Language;
    const tests = (Array.isArray(d.tests) ? d.tests : []) as TestCase[];
    if (!tests.length) return NextResponse.json({ error: "This exercise has no tests." }, { status: 400 });

    const grade = await gradeExercise({ language, source: parsed.data.source, tests });

    // Persist latest code + result (resume + history).
    await prisma.codeSubmission.upsert({
      where: { userId_exerciseId: { userId: user.id, exerciseId: block.id } },
      update: {
        language,
        code: parsed.data.source,
        passed: grade.passed,
        results: { results: grade.results, passedCount: grade.passedCount, totalCount: grade.totalCount },
      },
      create: {
        userId: user.id,
        exerciseId: block.id,
        lessonId: parsed.data.lessonId,
        language,
        code: parsed.data.source,
        passed: grade.passed,
        results: { results: grade.results, passedCount: grade.passedCount, totalCount: grade.totalCount },
      },
    });

    // Feed lesson completion + knowledge score.
    const progress = readProgress(enrollment.progress);
    progress.lessons ??= {};
    const lp = progress.lessons[parsed.data.lessonId] ?? {};
    lp.exercises = {
      ...(lp.exercises ?? {}),
      [block.id]: { passed: grade.passed, passedCount: grade.passedCount, totalCount: grade.totalCount },
    };
    const updated = await recompute(parsed.data.lessonId, lp);
    progress.lessons[parsed.data.lessonId] = updated;
    await persistProgress(enrollment.id, progress);

    return NextResponse.json({
      results: grade.results,
      passedCount: grade.passedCount,
      totalCount: grade.totalCount,
      passed: grade.passed,
      run: grade.lastRun,
      lessonCompleted: !!updated.completed,
      score: updated.score,
    });
  }

  return NextResponse.json({ error: "Unknown mode." }, { status: 400 });
}
