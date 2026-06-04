import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, PlayCircle, CalendarClock, ArrowRight, Sparkles, Flame, CheckCircle2 } from "lucide-react";
import { getMyClassroom } from "@/server/classroom";
import { getStreak } from "@/server/learning";
import { getCurrentUser } from "@/server/session";
import { ProgressRing } from "@/components/classroom/progress-ring";
import { Button } from "@/components/ui/button";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { SmartImage } from "@/components/shared/smart-image";
import { accentForSlug } from "@/server/courses";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Classroom", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ClassroomPage() {
  const courses = await getMyClassroom();
  if (courses === null) redirect("/auth/signin?callbackUrl=/classroom");

  const user = await getCurrentUser();
  const streak = user?.id ? await getStreak(user.id) : 0;

  const inProgress = courses.filter((c) => c.percent > 0 && c.percent < 100);
  const continueCard = inProgress[0] ?? courses[0];
  const resumeHref = (c: { courseId: string; resumeLessonId: string | null }) =>
    `/classroom/${c.courseId}${c.resumeLessonId ? `?lesson=${c.resumeLessonId}` : ""}`;

  return (
    <div className="container-page pb-16 pt-28 md:pt-32">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Your Classroom</h1>
          <p className="mt-2 text-fg-muted">Pick up where you left off and keep building.</p>
        </div>
        {streak > 0 && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3.5 py-2 text-sm font-semibold text-[#f5a623]"
            title="Consecutive days with lesson activity"
          >
            <Flame className="size-4" /> {streak}-day streak
          </span>
        )}
      </header>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[20px] border border-dashed border-border py-20 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-bg-subtle text-fg-faint">
            <GraduationCap className="size-7" />
          </span>
          <div>
            <p className="text-lg font-semibold">No courses yet</p>
            <p className="mt-1 text-sm text-fg-muted">Enroll in a course (they&apos;re free right now!) to start learning.</p>
          </div>
          <Button asChild className="mt-2"><Link href="/courses">Browse courses <ArrowRight className="size-4" /></Link></Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-8">
            {/* Continue learning */}
            {continueCard && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-faint">Continue learning</h2>
                <Link
                  href={resumeHref(continueCard)}
                  className="group flex flex-col gap-4 overflow-hidden rounded-[20px] border border-border bg-bg-elevated p-5 transition-colors hover:border-border-strong sm:flex-row sm:items-center"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-[14px] sm:w-56">
                    <SmartImage src={continueCard.thumbnail ?? ""} alt={continueCard.title} sizes="224px" fallbackClassName={cn("bg-gradient-to-br", accentForSlug(continueCard.slug))} />
                    <span className="absolute inset-0 grid place-items-center bg-black/30">
                      <PlayCircle className="size-12 text-white/90 transition-transform group-hover:scale-110" />
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {continueCard.isLive && <LiveBadge />}
                      <Badge variant={continueCard.type === "PAID" ? "brand" : "default"}>{continueCard.type === "PAID" ? "Purchased" : "Free"}</Badge>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{continueCard.title}</h3>
                    <p className="text-sm text-fg-muted">{continueCard.instructor}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-subtle">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${continueCard.percent}%` }} />
                      </div>
                      <span className="text-xs text-fg-muted">{continueCard.percent}%</span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* All enrolled */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-faint">Your courses</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {courses.map((c) => (
                  <Link
                    key={c.courseId}
                    href={resumeHref(c)}
                    className="group flex items-center gap-4 rounded-[18px] border border-border bg-bg-elevated p-4 transition-colors hover:border-border-strong"
                  >
                    <ProgressRing percent={c.percent} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-fg group-hover:text-brand-glow">{c.title}</h3>
                      {c.completedCourse ? (
                        <p className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <CheckCircle2 className="size-3.5" /> Completed
                        </p>
                      ) : (
                        <p className="text-xs text-fg-muted">{c.completedLessons}/{c.totalLessons} lessons</p>
                      )}
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-fg-faint transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Upcoming live sessions */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-[18px] border border-border bg-bg-elevated p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-fg">
                <CalendarClock className="size-4 text-brand" /> Upcoming live sessions
              </h2>
              <ul className="flex flex-col gap-3">
                {courses.filter((c) => c.isLive).slice(0, 3).map((c, i) => (
                  <li key={c.courseId} className="flex items-start gap-3 text-sm">
                    <span className="grid size-9 shrink-0 flex-col place-items-center rounded-[10px] bg-bg-subtle text-center">
                      <span className="text-[10px] leading-none text-fg-faint">SAT</span>
                      <span className="text-sm font-bold leading-none text-fg">{14 + i * 7}</span>
                    </span>
                    <div>
                      <p className="font-medium text-fg">{c.title}</p>
                      <p className="text-xs text-fg-muted">Live Q&amp;A · 7:00 PM IST</p>
                    </div>
                  </li>
                ))}
                {courses.filter((c) => c.isLive).length === 0 && (
                  <li className="text-sm text-fg-muted">No live sessions scheduled. Self-paced lessons are ready anytime.</li>
                )}
              </ul>
            </div>
            <div className="rounded-[18px] border border-brand/30 bg-brand/8 p-5">
              <Sparkles className="size-5 text-brand" />
              <p className="mt-2 text-sm font-medium text-fg">Stuck? Your AI tutor is in every lesson.</p>
              <p className="mt-1 text-xs text-fg-muted">Open any lesson and ask away — it knows what you&apos;re studying.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
