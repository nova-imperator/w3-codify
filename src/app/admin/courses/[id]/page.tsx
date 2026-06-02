import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAdminCourse, getAdminMedia } from "@/server/admin/queries";
import { CourseForm } from "@/components/admin/course-form";
import { CourseEditorTabs } from "@/components/admin/course-editor-tabs";
import { CurriculumBuilder } from "@/components/admin/curriculum/curriculum-builder";
import { StatusPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, instructors, media] = await Promise.all([
    getAdminCourse(id),
    prisma.instructor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getAdminMedia(),
  ]);
  if (!course) notFound();

  const initial = {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle ?? "",
    description: course.description,
    thumbnail: course.thumbnail ?? "",
    previewVideo: course.previewVideo ?? "",
    priceInr: course.priceInr,
    mrpInr: course.mrpInr ?? 0,
    isLive: course.isLive,
    level: course.level,
    tags: course.tags,
    outcomes: course.outcomes,
    requirements: course.requirements,
    instructorIds: course.instructors.map((i) => i.id),
  };

  const sections = course.sections.map((s) => ({
    id: s.id,
    title: s.title,
    lessons: s.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      durationSec: l.durationSec,
      isFreePreview: l.isFreePreview,
      videoUrl: l.videoUrl,
      blocks: l.blocks.map((b) => ({
        id: b.id,
        type: b.type,
        data: (b.data as Record<string, unknown>) ?? {},
        mediaId: b.mediaId,
        media: b.media ? { id: b.media.id, url: b.media.url, alt: b.media.alt } : null,
      })),
    })),
  }));

  const mediaItems = media.map((m) => ({ id: m.id, url: m.url, alt: m.alt }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Back to courses
        </Link>
        <div className="flex items-center gap-3">
          <StatusPill status={course.status} />
          {course.status === "PUBLISHED" && (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/courses/${course.slug}`} target="_blank">
                <ExternalLink className="size-3.5" /> View live
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-semibold">{course.title}</h2>
        <p className="text-sm text-fg-muted">/{course.slug}</p>
      </div>

      <CourseEditorTabs
        details={<CourseForm instructors={instructors} initial={initial} />}
        curriculum={<CurriculumBuilder courseId={course.id} initialSections={sections} media={mediaItems} />}
      />
    </div>
  );
}
