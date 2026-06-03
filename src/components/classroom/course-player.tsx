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
  CheckCircle2,
  Circle,
  Award,
  ListChecks,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LessonBlocks, type RenderBlock, type QuizState, type SavedCode } from "./lesson-blocks";
import { AiTutorPanel } from "./ai-tutor-panel";
import { AssessmentPanel, type AssessmentData } from "./assessment-panel";
import {
  recordQuiz,
  markVideoWatched,
  markLessonDone,
} from "@/server/classroom-actions";

type Lesson = {
  id: string;
  title: string;
  durationSec: number;
  videoUrl: string | null;
  sectionTitle: string;
  blocks: RenderBlock[];
};
type Section = { id: string; title: string; lessons: Lesson[] };
type Lp = {
  videoDone?: boolean;
  quiz?: QuizState;
  exercises?: Record<string, { passed: boolean; passedCount: number; totalCount: number }>;
  completed?: boolean;
  score?: { correct: number; total: number };
};
type View = { kind: "lesson"; id: string } | { kind: "assessment"; id: string };

export function CoursePlayer({
  courseId,
  courseTitle,
  courseSlug,
  sections,
  assessments,
  initialProgress,
  submissions,
}: {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  sections: Section[];
  assessments: AssessmentData[];
  initialProgress: {
    lessons?: Record<string, Lp>;
    assessments?: Record<string, { score: number; total: number; passed: boolean }>;
    certificate?: { at: string; scorePct: number } | null;
  };
  submissions?: SavedCode;
}) {
  const flat = React.useMemo(() => sections.flatMap((s) => s.lessons), [sections]);
  const [lp, setLp] = React.useState<Record<string, Lp>>(initialProgress.lessons ?? {});
  const [aResults, setAResults] = React.useState<Record<string, { passed: boolean }>>(
    initialProgress.assessments ?? {},
  );
  const [certified, setCertified] = React.useState(!!initialProgress.certificate);
  const [view, setView] = React.useState<View>({ kind: "lesson", id: flat[0]?.id ?? "" });
  const [lessonsOpen, setLessonsOpen] = React.useState(false);
  const [tutorOpen, setTutorOpen] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) setTutorOpen(true);
  }, []);

  const total = flat.length;
  const completedCount = flat.filter((l) => lp[l.id]?.completed).length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;

  function select(v: View) {
    setView(v);
    setLessonsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!flat.length) {
    return <p className="container-page py-32 text-center text-fg-muted">This course has no lessons yet.</p>;
  }

  const activeLesson = view.kind === "lesson" ? flat.find((l) => l.id === view.id) ?? flat[0] : null;
  const activeAssessment =
    view.kind === "assessment" ? assessments.find((a) => a.id === view.id) ?? null : null;

  return (
    <div className="lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-80 shrink-0 flex-col overflow-y-auto border-r border-border bg-bg-elevated/40 lg:flex">
        <SidebarHeader courseId={courseId} courseSlug={courseSlug} courseTitle={courseTitle} percent={percent} completed={completedCount} total={total} certified={certified} />
        <Nav sections={sections} assessments={assessments} lp={lp} aResults={aResults} view={view} onSelect={select} />
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1 pt-16">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 lg:hidden">
          <button onClick={() => setLessonsOpen(true)} className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted">
            <ListVideo className="size-4" /> Contents
          </button>
          <span className="text-xs text-fg-faint">{percent}% complete</span>
          {activeLesson && (
            <button onClick={() => setTutorOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
              <Sparkles className="size-4" /> AI Tutor
            </button>
          )}
        </div>

        {activeAssessment ? (
          <AssessmentPanel
            key={activeAssessment.id}
            courseId={courseId}
            courseSlug={courseSlug}
            assessment={activeAssessment}
            prior={
              initialProgress.assessments?.[activeAssessment.id]
                ? {
                    score: initialProgress.assessments[activeAssessment.id].score,
                    total: initialProgress.assessments[activeAssessment.id].total,
                    passed: initialProgress.assessments[activeAssessment.id].passed,
                  }
                : undefined
            }
            onResult={(r) => {
              setAResults((prev) => ({ ...prev, [activeAssessment.id]: { passed: r.passed } }));
              if (r.certificate) setCertified(true);
            }}
          />
        ) : activeLesson ? (
          <LessonView
            key={activeLesson.id}
            courseId={courseId}
            lesson={activeLesson}
            index={flat.findIndex((l) => l.id === activeLesson.id)}
            total={total}
            state={lp[activeLesson.id] ?? {}}
            submissions={submissions}
            onLessonState={(s) => setLp((prev) => ({ ...prev, [activeLesson.id]: { ...prev[activeLesson.id], ...s } }))}
            onPrev={() => {
              const i = flat.findIndex((l) => l.id === activeLesson.id);
              if (i > 0) select({ kind: "lesson", id: flat[i - 1].id });
            }}
            onNext={() => {
              const i = flat.findIndex((l) => l.id === activeLesson.id);
              if (i < total - 1) select({ kind: "lesson", id: flat[i + 1].id });
            }}
          />
        ) : null}
      </main>

      {/* Tutor dock */}
      {tutorOpen && activeLesson && (
        <div className="fixed inset-0 z-40 bg-black/60 xl:hidden" onClick={() => setTutorOpen(false)} />
      )}
      {activeLesson && (
        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-bg transition-transform xl:sticky xl:top-16 xl:z-auto xl:h-[calc(100dvh-4rem)] xl:w-[380px] xl:translate-x-0",
            tutorOpen ? "translate-x-0" : "translate-x-full xl:hidden",
          )}
        >
          <button onClick={() => setTutorOpen(false)} className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-bg-subtle xl:hidden" aria-label="Close tutor">
            <X className="size-5" />
          </button>
          <AiTutorPanel courseId={courseId} lessonId={activeLesson.id} lessonTitle={activeLesson.title} />
        </aside>
      )}

      {/* Mobile contents drawer */}
      {lessonsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setLessonsOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r border-border bg-bg">
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="font-semibold">Course contents</span>
              <button onClick={() => setLessonsOpen(false)} aria-label="Close"><X className="size-5 text-fg-muted" /></button>
            </div>
            <div className="overflow-y-auto">
              <Nav sections={sections} assessments={assessments} lp={lp} aResults={aResults} view={view} onSelect={select} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function LessonView({
  courseId,
  lesson,
  index,
  total,
  state,
  submissions,
  onLessonState,
  onPrev,
  onNext,
}: {
  courseId: string;
  lesson: Lesson;
  index: number;
  total: number;
  state: Lp;
  submissions?: SavedCode;
  onLessonState: (s: Partial<Lp>) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const hasVideo =
    !!lesson.videoUrl ||
    lesson.blocks.some((b) => (b.type === "VIDEO" || b.type === "EMBED") && typeof b.data?.url === "string" && b.data.url);
  const quizCount = lesson.blocks.filter((b) => b.type === "QUIZ").length;
  const exerciseIds = lesson.blocks.filter((b) => b.type === "CODE_EXERCISE").map((b) => b.id);
  const exercisePassed = exerciseIds.filter((id) => state.exercises?.[id]?.passed).length;
  const quizPassed = state.quiz ? Object.values(state.quiz).filter((q) => q.correct).length : 0;
  const completed = !!state.completed;
  const gated = hasVideo || quizCount > 0 || exerciseIds.length > 0;

  async function onExercise(blockId: string, r: { passed: boolean; passedCount: number; totalCount: number; lessonCompleted: boolean; score?: { correct: number; total: number } }) {
    const wasComplete = completed;
    onLessonState({
      exercises: { ...(state.exercises ?? {}), [blockId]: { passed: r.passed, passedCount: r.passedCount, totalCount: r.totalCount } },
      completed: r.lessonCompleted,
      score: r.score,
    });
    if (r.lessonCompleted && !wasComplete) toast.success("Lesson complete! 🎉");
  }

  async function onQuiz(blockId: string, picked: number, correct: boolean) {
    onLessonState({ quiz: { ...(state.quiz ?? {}), [blockId]: { picked, correct } } });
    const res = await recordQuiz(courseId, lesson.id, blockId, picked, correct);
    if (res.ok && res.data) {
      const wasComplete = completed;
      onLessonState({ completed: res.data.completed, score: res.data.score });
      if (res.data.completed && !wasComplete) toast.success("Lesson complete! 🎉");
    }
  }

  async function watchVideo() {
    setBusy(true);
    const res = await markVideoWatched(courseId, lesson.id, true);
    setBusy(false);
    if (res.ok && res.data) {
      onLessonState({ videoDone: true, completed: res.data.completed });
      if (res.data.completed) toast.success("Lesson complete! 🎉");
    }
  }

  async function markDone() {
    setBusy(true);
    const res = await markLessonDone(courseId, lesson.id);
    setBusy(false);
    if (res.ok) {
      onLessonState({ completed: true });
      toast.success("Marked complete");
    } else toast.error(res.error);
  }

  return (
    <article className="container-page max-w-3xl py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">{lesson.sectionTitle}</p>
      <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{lesson.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-fg-faint">
        <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {formatDuration(lesson.durationSec)}</span>
        <span>Lesson {index + 1} of {total}</span>
        {quizCount > 0 && <span>· {quizPassed}/{quizCount} checkpoints</span>}
        {completed && <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3.5" /> Complete</span>}
      </div>

      {/* Video */}
      {lesson.videoUrl ? (
        <div className="mt-6 aspect-video overflow-hidden rounded-[16px] border border-border bg-black">
          <iframe src={lesson.videoUrl} className="size-full" allowFullScreen title={lesson.title} />
        </div>
      ) : hasVideo ? null : (
        <div className="mt-6 grid aspect-video place-items-center rounded-[16px] border border-border bg-bg-elevated">
          <div className="flex flex-col items-center gap-2 text-fg-faint">
            <PlayCircle className="size-10" />
            <p className="text-sm">Video lessons stream here (Mux) — read the lesson below.</p>
          </div>
        </div>
      )}
      {hasVideo && (
        <div className="mt-3">
          {state.videoDone ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="size-4" /> Video watched</span>
          ) : (
            <Button variant="secondary" size="sm" onClick={watchVideo} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
              Mark video watched
            </Button>
          )}
        </div>
      )}

      {/* Blocks */}
      <div className="mt-8">
        <LessonBlocks
          blocks={lesson.blocks}
          savedQuiz={state.quiz}
          onQuiz={onQuiz}
          courseId={courseId}
          lessonId={lesson.id}
          savedCode={submissions}
          onExercise={onExercise}
        />
      </div>

      {/* Completion status */}
      <div className="mt-10 border-t border-border pt-6">
        {completed ? (
          <p className="flex items-center gap-2 font-medium text-success"><CheckCircle2 className="size-5" /> Lesson complete</p>
        ) : gated ? (
          <div className="flex flex-col gap-1.5 text-sm">
            <p className="font-medium text-fg">To complete this lesson:</p>
            {hasVideo && <Gate done={!!state.videoDone}>Watch the video</Gate>}
            {quizCount > 0 && <Gate done={quizPassed === quizCount}>Pass all checkpoints ({quizPassed}/{quizCount})</Gate>}
            {exerciseIds.length > 0 && <Gate done={exercisePassed === exerciseIds.length}>Pass the code exercise{exerciseIds.length > 1 ? "s" : ""} ({exercisePassed}/{exerciseIds.length})</Gate>}
          </div>
        ) : (
          <Button onClick={markDone} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Mark as done
          </Button>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" disabled={index <= 0} onClick={onPrev}>
            <ChevronLeft className="size-4" /> Previous
          </Button>
          <Button variant="ghost" size="sm" disabled={index >= total - 1} onClick={onNext}>
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function Gate({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-2", done ? "text-success" : "text-fg-muted")}>
      {done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
      {children}
    </span>
  );
}

function SidebarHeader({
  courseId, courseSlug, courseTitle, percent, completed, total, certified,
}: {
  courseId: string; courseSlug: string; courseTitle: string; percent: number; completed: number; total: number; certified: boolean;
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
          <div className="bg-accent-grad h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
      {certified && (
        <Link href={`/classroom/${courseId}/certificate`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
          <Award className="size-3.5" /> View certificate
        </Link>
      )}
    </div>
  );
}

function Nav({
  sections, assessments, lp, aResults, view, onSelect,
}: {
  sections: Section[];
  assessments: AssessmentData[];
  lp: Record<string, Lp>;
  aResults: Record<string, { passed: boolean }>;
  view: View;
  onSelect: (v: View) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-3">
      {sections.map((s) => (
        <div key={s.id}>
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-fg-faint">{s.title}</p>
          <ul className="flex flex-col">
            {s.lessons.map((l) => {
              const done = !!lp[l.id]?.completed;
              const active = view.kind === "lesson" && view.id === l.id;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => onSelect({ kind: "lesson", id: l.id })}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm transition-colors",
                      active ? "bg-brand/12 text-fg" : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
                    )}
                  >
                    <span className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border text-[10px]",
                      done ? "border-success bg-success text-white" : active ? "border-brand text-brand" : "border-border-strong text-transparent",
                    )}>
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

      {assessments.length > 0 && (
        <div>
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-fg-faint">Assessments</p>
          <ul className="flex flex-col">
            {assessments.map((a) => {
              const passed = aResults[a.id]?.passed;
              const active = view.kind === "assessment" && view.id === a.id;
              const isFinal = a.tier === null;
              return (
                <li key={a.id}>
                  <button
                    onClick={() => onSelect({ kind: "assessment", id: a.id })}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm transition-colors",
                      active ? "bg-brand/12 text-fg" : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
                    )}
                  >
                    <span className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border text-[10px]",
                      passed ? "border-success bg-success text-white" : "border-border-strong text-fg-faint",
                    )}>
                      {passed ? <Check className="size-3" strokeWidth={3} /> : isFinal ? <Award className="size-3" /> : <ListChecks className="size-3" />}
                    </span>
                    <span className="line-clamp-2 flex-1">{a.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
