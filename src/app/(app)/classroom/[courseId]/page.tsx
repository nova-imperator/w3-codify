import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getCoursePlayer } from "@/server/classroom";
import { CoursePlayer } from "@/components/classroom/course-player";
import { Button } from "@/components/ui/button";
import type { RenderBlock } from "@/components/classroom/lesson-blocks";

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

  const { course, progress } = result;
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
        data: (b.data as Record<string, unknown>) ?? {},
        media: b.media ? { url: b.media.url, alt: b.media.alt } : null,
      })),
    })),
  }));

  return (
    <CoursePlayer
      courseId={course.id}
      courseTitle={course.title}
      courseSlug={course.slug}
      sections={sections}
      initialProgress={progress}
    />
  );
}
