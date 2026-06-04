"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Check,
  PlayCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Circle,
  Award,
  ListChecks,
  PanelLeft,
  PanelLeftClose,
  Maximize2,
  Minimize2,
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

// Persisted layout/resume state, per course.
type Persisted = { v?: View; sb?: boolean; tu?: boolean; fo?: boolean };

function persistKey(courseId: string) {
  return `w3c:classroom:${courseId}`;
}

/** Don't fire shortcuts while typing in a field or the code editor. */
function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    (el as HTMLElement).isContentEditable ||
    !!el.closest(".monaco-editor")
  );
}

function useIsDesktop() {
  const [desktop, setDesktop] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

export function CoursePlayer({
  courseId,
  courseTitle,
  courseSlug,
  sections,
  assessments,
  initialProgress,
  submissions,
  aiTutorEnabled = true,
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
  aiTutorEnabled?: boolean;
}) {
  const flat = React.useMemo(() => sections.flatMap((s) => s.lessons), [sections]);
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();

  const [lp, setLp] = React.useState<Record<string, Lp>>(initialProgress.lessons ?? {});
  const [aResults, setAResults] = React.useState<Record<string, { passed: boolean }>>(
    initialProgress.assessments ?? {},
  );
  const [certified, setCertified] = React.useState(!!initialProgress.certificate);
  const [view, setView] = React.useState<View>({ kind: "lesson", id: flat[0]?.id ?? "" });

  // Layout: sidebar open by default, tutor closed by default (overridden by persistence).
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [tutorOpen, setTutorOpen] = React.useState(false);
  const [focusMode, setFocusMode] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const validView = React.useCallback(
    (v: View) =>
      (v.kind === "lesson" && flat.some((l) => l.id === v.id)) ||
      (v.kind === "assessment" && assessments.some((a) => a.id === v.id)),
    [flat, assessments],
  );

  // Restore persisted layout + last lesson (resume). Falls back to viewport defaults.
  React.useEffect(() => {
    setMounted(true);
    let saved: Persisted | null = null;
    try {
      const raw = localStorage.getItem(persistKey(courseId));
      if (raw) saved = JSON.parse(raw) as Persisted;
    } catch {
      /* ignore corrupt storage */
    }
    if (saved?.v && validView(saved.v)) setView(saved.v);
    if (typeof saved?.tu === "boolean") setTutorOpen(saved.tu);
    if (typeof saved?.fo === "boolean") setFocusMode(saved.fo);
    if (typeof saved?.sb === "boolean") setSidebarOpen(saved.sb);
    else if (!window.matchMedia("(min-width: 1024px)").matches) setSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Persist on change.
  React.useEffect(() => {
    if (!mounted) return;
    try {
      const data: Persisted = { v: view, sb: sidebarOpen, tu: tutorOpen, fo: focusMode };
      localStorage.setItem(persistKey(courseId), JSON.stringify(data));
    } catch {
      /* storage full / unavailable */
    }
  }, [mounted, courseId, view, sidebarOpen, tutorOpen, focusMode]);

  const total = flat.length;
  const completedCount = flat.filter((l) => lp[l.id]?.completed).length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;

  const activeLesson = view.kind === "lesson" ? flat.find((l) => l.id === view.id) ?? flat[0] : null;
  const activeAssessment =
    view.kind === "assessment" ? assessments.find((a) => a.id === view.id) ?? null : null;
  const lessonIdx = activeLesson ? flat.findIndex((l) => l.id === activeLesson.id) : -1;
  const hasNext = lessonIdx >= 0 && (lessonIdx < total - 1 || assessments.length > 0);

  const select = React.useCallback((v: View) => {
    setView(v);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goPrev = React.useCallback(() => {
    if (lessonIdx > 0) select({ kind: "lesson", id: flat[lessonIdx - 1].id });
  }, [lessonIdx, flat, select]);

  const goNext = React.useCallback(() => {
    if (lessonIdx >= 0 && lessonIdx < total - 1) {
      select({ kind: "lesson", id: flat[lessonIdx + 1].id });
    } else if (lessonIdx === total - 1 && assessments.length > 0) {
      select({ kind: "assessment", id: assessments[0].id });
    }
  }, [lessonIdx, total, flat, assessments, select]);

  // Keyboard shortcuts (stable listener via ref).
  const actionsRef = React.useRef({ goPrev, goNext, sidebarOpen, tutorOpen, mobileNavOpen, isDesktop });
  actionsRef.current = { goPrev, goNext, sidebarOpen, tutorOpen, mobileNavOpen, isDesktop };
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const a = actionsRef.current;
      if (e.key === "Escape") {
        if (a.mobileNavOpen) setMobileNavOpen(false);
        else if (a.tutorOpen) setTutorOpen(false);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(document.activeElement)) return;
      const k = e.key.toLowerCase();
      if (k === "arrowright" || k === "k") {
        e.preventDefault();
        a.goNext();
      } else if (k === "arrowleft" || k === "j") {
        e.preventDefault();
        a.goPrev();
      } else if (k === "t" && aiTutorEnabled) {
        e.preventDefault();
        setTutorOpen((o) => !o);
      } else if (k === "f") {
        e.preventDefault();
        setFocusMode((f) => !f);
      } else if (k === "b") {
        e.preventDefault();
        if (a.isDesktop) setSidebarOpen((o) => !o);
        else setMobileNavOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiTutorEnabled]);

  if (!flat.length) {
    return <p className="container-page py-32 text-center text-fg-muted">This course has no lessons yet.</p>;
  }

  const showSidebar = sidebarOpen && !focusMode;
  const showTutor = aiTutorEnabled && tutorOpen && !focusMode;
  const slide = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 40 };

  function toggleContents() {
    if (isDesktop) setSidebarOpen((o) => !o);
    else setMobileNavOpen((o) => !o);
  }

  const nav = (
    <Nav sections={sections} assessments={assessments} lp={lp} aResults={aResults} view={view} onSelect={select} />
  );

  return (
    <div className="lg:flex">
      {/* Desktop sidebar — sticky, independent native scroll (trackpad/wheel/touch). */}
      <motion.aside
        className="hidden w-80 shrink-0 lg:block"
        initial={false}
        animate={{ marginLeft: showSidebar ? 0 : "-20rem", opacity: showSidebar ? 1 : 0 }}
        transition={slide}
        aria-hidden={!showSidebar}
        inert={!showSidebar ? true : undefined}
      >
        <div className="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto overscroll-contain border-r border-border bg-bg-elevated/40">
          <SidebarHeader courseId={courseId} courseSlug={courseSlug} courseTitle={courseTitle} percent={percent} completed={completedCount} total={total} certified={certified} />
          {nav}
        </div>
      </motion.aside>

      {/* Main */}
      <main className="min-w-0 flex-1 pt-16">
        {/* Toolbar: contents toggle + progress + focus/tutor */}
        <div className="sticky top-16 z-20 flex items-center gap-3 border-b border-border bg-bg/80 px-4 py-2.5 backdrop-blur-md">
          <button
            onClick={toggleContents}
            className="grid size-9 shrink-0 place-items-center rounded-[10px] text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
            aria-label={showSidebar ? "Hide contents" : "Show contents"}
            title="Toggle contents (B)"
          >
            {showSidebar ? <PanelLeftClose className="size-5" /> : <PanelLeft className="size-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-xs text-fg-muted">
              <span className="truncate">
                {activeAssessment ? activeAssessment.title : `Lesson ${lessonIdx + 1} of ${total}`}
              </span>
              <span className="shrink-0 tabular-nums">{percent}% complete</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg-subtle" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="bg-accent-grad h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <button
            onClick={() => setFocusMode((f) => !f)}
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-[10px] transition-colors hover:bg-bg-subtle",
              focusMode ? "text-brand" : "text-fg-muted hover:text-fg",
            )}
            aria-pressed={focusMode}
            aria-label="Focus mode"
            title="Focus mode (F)"
          >
            {focusMode ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
          {aiTutorEnabled && (
            <button
              onClick={() => setTutorOpen((o) => !o)}
              className={cn(
                "hidden size-9 shrink-0 place-items-center rounded-[10px] transition-colors hover:bg-bg-subtle sm:grid",
                tutorOpen ? "text-brand" : "text-fg-muted hover:text-fg",
              )}
              aria-pressed={tutorOpen}
              aria-label="AI Tutor"
              title="AI Tutor (T)"
            >
              <Sparkles className="size-5" />
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
            index={lessonIdx}
            total={total}
            hasNext={hasNext}
            state={lp[activeLesson.id] ?? {}}
            submissions={submissions}
            onLessonState={(s) => setLp((prev) => ({ ...prev, [activeLesson.id]: { ...prev[activeLesson.id], ...s } }))}
            onPrev={goPrev}
            onNext={goNext}
          />
        ) : null}
      </main>

      {/* Desktop AI tutor — in-flow, slides in from the right; main widens when closed. */}
      {aiTutorEnabled && activeLesson && (
        <motion.aside
          className="hidden w-[380px] shrink-0 lg:block"
          initial={false}
          animate={{ marginRight: showTutor ? 0 : "-380px", opacity: showTutor ? 1 : 0 }}
          transition={slide}
          aria-hidden={!showTutor}
          inert={!showTutor ? true : undefined}
        >
          <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden border-l border-border bg-bg-elevated/30">
            <AiTutorPanel
              key={activeLesson.id}
              courseId={courseId}
              lessonId={activeLesson.id}
              lessonTitle={activeLesson.title}
            />
          </div>
        </motion.aside>
      )}

      {/* Floating "Ask AI Tutor" toggle (when closed) */}
      {aiTutorEnabled && activeLesson && !showTutor && (
        <button
          onClick={() => setTutorOpen(true)}
          className="bg-accent-grad fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(99,102,241,0.6)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          aria-label="Open AI Tutor"
          title="Ask AI Tutor (T)"
        >
          <Sparkles className="size-5" />
          <span className="hidden sm:inline">Ask AI Tutor</span>
        </button>
      )}

      {/* Mobile: contents bottom-sheet */}
      {mounted && (
        <BottomSheet open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="Course contents" reduce={reduce}>
          <div className="h-full overflow-y-auto overscroll-contain">
            <SidebarHeader courseId={courseId} courseSlug={courseSlug} courseTitle={courseTitle} percent={percent} completed={completedCount} total={total} certified={certified} />
            {nav}
          </div>
        </BottomSheet>
      )}

      {/* Mobile: AI tutor bottom-sheet */}
      {mounted && aiTutorEnabled && activeLesson && (
        <BottomSheet
          open={tutorOpen && !isDesktop}
          onClose={() => setTutorOpen(false)}
          title="AI Tutor"
          reduce={reduce}
          height="h-[80dvh]"
        >
          <AiTutorPanel courseId={courseId} lessonId={activeLesson.id} lessonTitle={activeLesson.title} />
        </BottomSheet>
      )}
    </div>
  );
}

function BottomSheet({
  open,
  onClose,
  title,
  children,
  reduce,
  height = "max-h-[85dvh]",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  reduce: boolean | null;
  height?: string;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              "absolute inset-x-0 bottom-0 flex flex-col rounded-t-[20px] border-t border-border bg-bg outline-none",
              height,
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 40 }}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="font-semibold">{title}</span>
              <button onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-bg-subtle">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LessonView({
  courseId,
  lesson,
  index,
  total,
  hasNext,
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
  hasNext: boolean;
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

  async function completeAndNext() {
    setBusy(true);
    const res = await markLessonDone(courseId, lesson.id);
    setBusy(false);
    if (res.ok) {
      onLessonState({ completed: true });
      toast.success("Marked complete");
      onNext();
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

      {/* Completion + navigation */}
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
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" disabled={index <= 0} onClick={onPrev}>
            <ChevronLeft className="size-4" /> Previous
          </Button>

          {completed ? (
            <Button size="sm" onClick={onNext} disabled={!hasNext}>
              {hasNext ? "Next lesson" : "All done"} <ChevronRight className="size-4" />
            </Button>
          ) : gated ? (
            <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasNext}>
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={completeAndNext} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Mark complete &amp; Next
            </Button>
          )}
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
                    aria-current={active ? "true" : undefined}
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
                    aria-current={active ? "true" : undefined}
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
