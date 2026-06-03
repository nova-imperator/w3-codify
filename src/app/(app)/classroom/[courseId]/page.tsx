import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getCoursePlayer } from "@/server/classroom";
import { CoursePlayer } from "@/components/classroom/course-player";
import { Button } from "@/components/ui/button";
import type { RenderBlock } from "@/components/classroom/lesson-blocks";
import type { AssessmentData } from "@/components/classroom/assessment-panel";

export const metadata: Metadata = { title: "Classroom", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CoursePlayerPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const result = await getCoursePlayer(courseId);

  if (result.status === "unauthed") redirect(`/auth/signin?callbackUrl=/classroom/${courseId}`);
  if (result.status === "not-found") notFound();
  if (result.status === "not-enrolled") {
    return (
      <div className="container-page flex min-h-[70svh] flex-col items-center justify-center gap-4 pt-28 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-bg-subtle text-fg-faint">
          <Lock className="size-6" />
        </span>
        <h1 className="text-2xl font-semibold">You&apos;re not enrolled yet</h1>
        <p className="max-w-md text-fg-muted">Enroll in this course (free during launch) to access the lessons and your AI tutor.</p>
        <Button asChild><Link href="/courses">Browse courses</Link></Button>
      </div>
    );
  }

  const { course, progress, submissions } = result;
  const sections = course.sections.map((s) => ({
    id: s.id,
    title: s.title,
    lessons: s.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      durationSec: l.durationSec,
      isFreePreview: l.isFreePreview,
      videoUrl: l.videoUrl,
      sectionTitle: s.title,
      blocks: l.blocks.map<RenderBlock>((b) => ({
        id: b.id,
        type: b.type,
        // CODE_EXERCISE: never ship the reference solution or hidden test
        // expectations to the client — grading happens server-side in /api/run.
        data:
          b.type === "CODE_EXERCISE"
            ? sanitizeExercise((b.data as Record<string, unknown>) ?? {})
            : ((b.data as Record<string, unknown>) ?? {}),
        media: b.media ? { url: b.media.url, alt: b.media.alt } : null,
      })),
    })),
  }));

  const assessments = course.assessments.map<AssessmentData>((a) => ({
    id: a.id,
    title: a.title,
    tier: a.tier,
    passPct: a.passPct,
    questions: (a.questions as AssessmentData["questions"]) ?? [],
  }));

  return (
    <CoursePlayer
      courseId={course.id}
      courseTitle={course.title}
      courseSlug={course.slug}
      sections={sections}
      assessments={assessments}
      initialProgress={progress}
      submissions={submissions}
    />
  );
}

/** Strip the solution + hidden test details before sending an exercise to the client. */
function sanitizeExercise(d: Record<string, unknown>): Record<string, unknown> {
  const rawTests = Array.isArray(d.tests) ? (d.tests as Record<string, unknown>[]) : [];
  const tests = rawTests.map((t, i) => {
    const hidden = !!t.hidden;
    const name = typeof t.name === "string" ? t.name : `Test ${i + 1}`;
    // Visible tests expose their input/expected; hidden tests reveal nothing but their existence.
    return hidden
      ? { name, hidden: true }
      : { name, hidden: false, input: t.input ?? "", expected: t.expected ?? "" };
  });
  return {
    language: d.language ?? "python",
    starterCode: d.starterCode ?? "",
    instructions: d.instructions ?? "",
    tests,
  };
}
