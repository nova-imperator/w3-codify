import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Users,
  ChevronRight,
  Globe,
  CalendarClock,
  Check,
  PlayCircle,
  Lock,
  BarChart3,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { EnrollCard } from "@/components/course/enroll-card";
import { CourseJsonLd } from "@/components/shared/json-ld";
import {
  getCourseBySlug,
  getPublishedSlugs,
  levelLabel,
  accentForSlug,
} from "@/server/courses";
import { formatCompact, formatDuration } from "@/lib/utils";
import { SITE } from "@/lib/site";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course not found" };
  const desc = course.subtitle ?? course.description.slice(0, 155);
  return {
    title: course.title,
    description: desc,
    alternates: { canonical: `/courses/${slug}` },
    openGraph: {
      title: `${course.title} · ${SITE.name}`,
      description: desc,
      url: `${SITE.url}/courses/${slug}`,
      type: "website",
    },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const lessons = course.sections.flatMap((s) => s.lessons);
  const totalSec = lessons.reduce((sum, l) => sum + l.durationSec, 0);
  const lessonCount = lessons.length;
  const instructor = course.instructors[0];
  const accent = accentForSlug(course.slug);

  return (
    <article className="container-page pb-12 pt-28 md:pt-32">
      <CourseJsonLd
        title={course.title}
        description={course.subtitle ?? course.description.slice(0, 200)}
        slug={course.slug}
        instructor={instructor?.name ?? ""}
        rating={course.rating}
        ratingCount={course.ratingCount}
      />

      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* ── Title / meta (mobile: 1st · desktop: top-left) ── */}
        <header className="order-1 flex flex-col gap-5 lg:col-start-1 lg:row-start-1">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
              <li><Link href="/" className="hover:text-fg">Home</Link></li>
              <ChevronRight className="size-3.5 text-fg-faint" />
              <li><Link href="/courses" className="hover:text-fg">Courses</Link></li>
              <ChevronRight className="size-3.5 text-fg-faint" />
              <li className="text-fg">{course.title}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {course.isLive ? <LiveBadge /> : <Badge variant="outline">Self-paced</Badge>}
            {course.tags.map((t) => (
              <Badge key={t} variant="default">{t}</Badge>
            ))}
          </div>

          <h1 className="text-[length:var(--text-display-sm)] font-semibold">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="max-w-2xl text-lg text-fg-muted">{course.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-muted">
            {course.ratingCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-brand text-brand" />
                <span className="font-semibold text-fg">{course.rating}</span>
                <span>({formatCompact(course.ratingCount)} ratings)</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" />
              {formatCompact(course.learners)} learners
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="size-4" />
              {levelLabel(course.level)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="size-4" />
              English
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              Updated{" "}
              {new Date(course.updatedAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {instructor && (
            <p className="text-sm text-fg-muted">
              Created by{" "}
              <span className="font-medium text-fg">{instructor.name}</span>
              {instructor.role && <span> · {instructor.role}</span>}
            </p>
          )}
        </header>

        {/* ── Enroll card (mobile: 2nd · desktop: right, sticky, spans rows) ── */}
        <aside className="order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-24">
            <EnrollCard
              courseId={course.id}
              slug={course.slug}
              title={course.title}
              priceInr={course.priceInr}
              mrpInr={course.mrpInr ?? 0}
              thumbnail={course.thumbnail ?? ""}
              accent={accent}
              totalSec={totalSec}
              lessonCount={lessonCount}
              resourceCount={Math.max(8, course.sections.length * 3)}
            />
          </div>
        </aside>

        {/* ── Body (mobile: 3rd · desktop: bottom-left) ── */}
        <div className="order-3 flex max-w-3xl flex-col gap-12 lg:col-start-1 lg:row-start-2">
          {course.outcomes.length > 0 && (
            <section>
              <h2 className="mb-5 text-2xl font-semibold">What you&apos;ll learn</h2>
              <div className="grid gap-3 rounded-[18px] border border-border bg-bg-elevated p-6 sm:grid-cols-2">
                {course.outcomes.map((o) => (
                  <div key={o} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} />
                    <span className="text-fg-muted">{o}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-2xl font-semibold">Course content</h2>
              <p className="text-sm text-fg-muted">
                {course.sections.length} sections · {lessonCount} lessons ·{" "}
                {formatDuration(totalSec)}
              </p>
            </div>
            <Accordion
              type="multiple"
              defaultValue={[course.sections[0]?.id].filter(Boolean) as string[]}
              className="flex flex-col gap-3"
            >
              {course.sections.map((section) => {
                const secSec = section.lessons.reduce((s, l) => s + l.durationSec, 0);
                return (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger>
                      <span className="flex flex-1 items-center justify-between gap-3 pr-3">
                        <span>{section.title}</span>
                        <span className="text-xs font-normal text-fg-faint">
                          {section.lessons.length} lessons · {formatDuration(secSec)}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col divide-y divide-border">
                        {section.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 py-3 text-sm">
                            {lesson.isFreePreview ? (
                              <PlayCircle className="size-4 shrink-0 text-brand" />
                            ) : (
                              <Lock className="size-4 shrink-0 text-fg-faint" />
                            )}
                            <span className="flex-1 text-fg">{lesson.title}</span>
                            {lesson.isFreePreview && (
                              <Badge variant="brand" className="hidden sm:inline-flex">
                                Free preview
                              </Badge>
                            )}
                            <span className="tabular-nums text-fg-faint">
                              {formatDuration(lesson.durationSec)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>

          {course.requirements.length > 0 && (
            <section>
              <h2 className="mb-5 text-2xl font-semibold">Requirements</h2>
              <ul className="flex flex-col gap-2.5">
                {course.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-fg-muted">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-fg-faint" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-5 text-2xl font-semibold">Description</h2>
            <p className="whitespace-pre-line leading-relaxed text-fg-muted">
              {course.description}
            </p>
          </section>

          {instructor && (
            <section>
              <h2 className="mb-5 text-2xl font-semibold">Your instructor</h2>
              <div className="flex items-start gap-4 rounded-[18px] border border-border bg-bg-elevated p-6">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-bg-subtle font-display text-lg font-bold text-fg">
                  {instructor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <p className="font-semibold text-fg">{instructor.name}</p>
                  {instructor.role && <p className="text-sm text-brand">{instructor.role}</p>}
                  {instructor.bio && <p className="mt-2 text-sm text-fg-muted">{instructor.bio}</p>}
                </div>
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Related topics</h2>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((t) => (
                <Link
                  key={t}
                  href={`/courses?tag=${encodeURIComponent(t)}`}
                  className="rounded-full border border-border bg-bg-elevated px-3.5 py-1.5 text-sm text-fg-muted transition-colors hover:border-brand/40 hover:text-fg"
                >
                  {t}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
