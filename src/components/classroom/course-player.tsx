"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  PlayCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ListVideo,
  Sparkles,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LessonBlocks, type RenderBlock } from "./lesson-blocks";
import { AiTutorPanel } from "./ai-tutor-panel";
import { setLessonComplete } from "@/server/classroom-actions";

type Lesson = {
  id: string;
  title: string;
  durationSec: number;
  isFreePreview: boolean;
  videoUrl: string | null;
  sectionTitle: string;
  blocks: RenderBlock[];
};
type Section = { id: string; title: string; lessons: Lesson[] };

export function CoursePlayer({
  courseId,
  courseTitle,
  courseSlug,
  sections,
  initialProgress,
}: {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  sections: Section[];
  initialProgress: Record<string, boolean>;
}) {
  const flat = React.useMemo(() => sections.flatMap((s) => s.lessons), [sections]);
  const [progress, setProgress] = React.useState(initialProgress);
  const [activeId, setActiveId] = React.useState(flat[0]?.id ?? "");
  const [lessonsOpen, setLessonsOpen] = React.useState(false);
  const [tutorOpen, setTutorOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Open the tutor by default on large screens.
  React.useEffect(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) setTutorOpen(true);
  }, []);

  const active = flat.find((l) => l.id === activeId) ?? flat[0];
  const activeIndex = flat.findIndex((l) => l.id === activeId);
  const total = flat.length;
  const completed = flat.filter((l) => progress[l.id]).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const isDone = active ? !!progress[active.id] : false;

  function select(id: string) {
    setActiveId(id);
    setLessonsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleComplete() {
    if (!active) return;
    const next = !isDone;
    setProgress((p) => ({ ...p, [active.id]: next }));
    setSaving(true);
    const res = await setLessonComplete(courseId, active.id, next);
    setSaving(false);
    if (!res.ok) {
      setProgress((p) => ({ ...p, [active.id]: !next }));
      toast.error(res.error);
    } else if (next && res.data?.percent === 100) {
      toast.success("🎉 Course complete — congratulations!");
    }
  }

  if (!active) {
    return <p className="container-page py-32 text-center text-fg-muted">This course has no lessons yet.</p>;
  }

  return (
    <div className="lg:flex">
      {/* Desktop lesson sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-80 shrink-0 flex-col overflow-y-auto border-r border-border bg-bg-elevated/40 lg:flex">
        <SidebarHeader courseSlug={courseSlug} courseTitle={courseTitle} percent={percent} completed={completed} total={total} />
        <LessonList sections={sections} activeId={activeId} progress={progress} onSelect={select} />
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1 pt-16">
        {/* Mobile bar */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 lg:hidden">
          <button onClick={() => setLessonsOpen(true)} className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted">
            <ListVideo className="size-4" /> Lessons
          </button>
          <span className="text-xs text-fg-faint">{percent}% complete</span>
          <button onClick={() => setTutorOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
            <Sparkles className="size-4" /> AI Tutor
          </button>
        </div>

        <article className="container-page max-w-3xl py-8">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">{active.sectionTitle}</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{active.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-fg-faint">
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {formatDuration(active.durationSec)}</span>
            <span>Lesson {activeIndex + 1} of {total}</span>
          </div>

          {/* Video */}
          {active.videoUrl ? (
            <div className="mt-6 aspect-video overflow-hidden rounded-[16px] border border-border bg-black">
              <iframe src={active.videoUrl} className="size-full" allowFullScreen title={active.title} />
            </div>
          ) : (
            <div className="mt-6 grid aspect-video place-items-center rounded-[16px] border border-border bg-bg-elevated">
              <div className="flex flex-col items-center gap-2 text-fg-faint">
                <PlayCircle className="size-10" />
                <p className="text-sm">Video lands with the Mux player — read the lesson below.</p>
              </div>
            </div>
          )}

          {/* Blocks */}
          <div className="mt-8">
            <LessonBlocks blocks={active.blocks} />
          </div>

          {/* Footer nav */}
          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6">
            <Button onClick={toggleComplete} disabled={saving} variant={isDone ? "secondary" : "primary"} className="w-full sm:w-auto sm:self-start">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {isDone ? "Completed — mark incomplete" : "Mark as complete"}
            </Button>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={activeIndex <= 0}
                onClick={() => select(flat[activeIndex - 1].id)}
              >
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={activeIndex >= total - 1}
                onClick={() => select(flat[activeIndex + 1].id)}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </article>
      </main>

      {/* Tutor dock (single instance; docked column on xl, drawer below) */}
      {tutorOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 xl:hidden"
          onClick={() => setTutorOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-bg transition-transform xl:sticky xl:top-16 xl:z-auto xl:h-[calc(100dvh-4rem)] xl:w-[380px] xl:translate-x-0",
          tutorOpen ? "translate-x-0" : "translate-x-full xl:hidden",
        )}
      >
        <button
          onClick={() => setTutorOpen(false)}
          className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-bg-subtle xl:hidden"
          aria-label="Close tutor"
        >
          <X className="size-5" />
        </button>
        <AiTutorPanel courseId={courseId} lessonId={active.id} lessonTitle={active.title} />
      </aside>

      {/* Mobile lesson drawer */}
      {lessonsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setLessonsOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r border-border bg-bg">
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="font-semibold">Lessons</span>
              <button onClick={() => setLessonsOpen(false)} aria-label="Close"><X className="size-5 text-fg-muted" /></button>
            </div>
            <div className="overflow-y-auto">
              <LessonList sections={sections} activeId={activeId} progress={progress} onSelect={select} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function SidebarHeader({
  courseSlug,
  courseTitle,
  percent,
  completed,
  total,
}: {
  courseSlug: string;
  courseTitle: string;
  percent: number;
  completed: number;
  total: number;
}) {
  return (
    <div className="border-b border-border p-4">
      <Link href={`/courses/${courseSlug}`} className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg">
        <ArrowLeft className="size-3.5" /> Course page
      </Link>
      <h2 className="mt-2 line-clamp-2 font-semibold text-fg">{courseTitle}</h2>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-fg-muted">
          <span>{percent}% complete</span>
          <span>{completed}/{total}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

function LessonList({
  sections,
  activeId,
  progress,
  onSelect,
}: {
  sections: Section[];
  activeId: string;
  progress: Record<string, boolean>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-3">
      {sections.map((s) => (
        <div key={s.id}>
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-fg-faint">{s.title}</p>
          <ul className="flex flex-col">
            {s.lessons.map((l) => {
              const done = !!progress[l.id];
              const active = l.id === activeId;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => onSelect(l.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm transition-colors",
                      active ? "bg-brand/12 text-fg" : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border text-[10px]",
                        done ? "border-success bg-success text-white" : active ? "border-brand text-brand" : "border-border-strong text-transparent",
                      )}
                    >
                      {done ? <Check className="size-3" strokeWidth={3} /> : <PlayCircle className="size-3" />}
                    </span>
                    <span className="line-clamp-2 flex-1">{l.title}</span>
                    <span className="shrink-0 text-[11px] text-fg-faint">{formatDuration(l.durationSec)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
