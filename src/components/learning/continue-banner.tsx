"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, X, ArrowRight } from "lucide-react";
import { getMyContinueLearning } from "@/server/learning-actions";
import type { ContinueCourse } from "@/server/learning";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "w3c:continue-dismissed"; // value = YYYY-MM-DD it was dismissed

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Dismissible "Continue learning" nudge (FEATURE_progress-continue §2).
 * Self-fetches the user's in-progress courses (so it works on static pages),
 * shows ONE banner for the most-recently-active course, with a "+N more" link.
 * Dismissal is remembered for the day. Renders nothing when there's nothing to resume.
 */
export function ContinueBanner({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [courses, setCourses] = React.useState<ContinueCourse[] | null>(null);
  const [dismissed, setDismissed] = React.useState(true); // assume dismissed until checked (no flash)

  React.useEffect(() => {
    let active = true;
    // Only show if not already dismissed today.
    let dz = true;
    try {
      dz = localStorage.getItem(DISMISS_KEY) === todayStr();
    } catch {
      dz = false;
    }
    setDismissed(dz);
    if (dz) return;
    getMyContinueLearning()
      .then((rows) => {
        if (active) setCourses(rows);
      })
      .catch(() => active && setCourses([]));
    return () => {
      active = false;
    };
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, todayStr());
    } catch {
      /* ignore */
    }
  }

  if (dismissed || !courses || courses.length === 0) return null;

  const top = courses[0];
  const more = courses.length - 1;
  const resumeHref = `/classroom/${top.courseId}${top.resumeLessonId ? `?lesson=${top.resumeLessonId}` : ""}`;

  return (
    <AnimatePresence>
      <motion.section
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -8 }}
        className={cn("container-page", className)}
        aria-label="Continue learning"
      >
        <div className="relative overflow-hidden rounded-[18px] border border-brand/30 bg-gradient-to-r from-brand/12 via-bg-elevated to-accent/10 p-4 sm:p-5">
          <button
            onClick={dismiss}
            aria-label="Dismiss continue-learning reminder"
            className="absolute right-3 top-3 grid size-7 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X className="size-4" />
          </button>

          <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:gap-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Continue learning</p>
              <h3 className="mt-0.5 truncate text-base font-semibold text-fg sm:text-lg">
                {top.title} — you&apos;re {top.percent}% done
              </h3>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-bg-subtle">
                  <div className="bg-accent-grad h-full rounded-full" style={{ width: `${Math.max(top.percent, 3)}%` }} />
                </div>
                <span className="shrink-0 text-xs text-fg-muted">{top.completed}/{top.total}</span>
              </div>
              {more > 0 && (
                <Link
                  href="/classroom"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-fg-muted hover:text-fg"
                >
                  +{more} more in progress <ArrowRight className="size-3" />
                </Link>
              )}
            </div>

            <Link
              href={resumeHref}
              className="bg-accent-grad inline-flex shrink-0 items-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Play className="size-4" /> Resume
            </Link>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
