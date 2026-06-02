"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CourseCardData } from "@/server/courses";

type Delivery = "all" | "live" | "self";
type LevelFilter = "all" | "Beginner" | "Intermediate" | "Advanced";

export function CourseCatalog({ courses }: { courses: CourseCardData[] }) {
  const [query, setQuery] = React.useState("");
  const [tag, setTag] = React.useState<string | null>(null);
  const [level, setLevel] = React.useState<LevelFilter>("all");
  const [delivery, setDelivery] = React.useState<Delivery>("all");

  const allTags = React.useMemo(
    () => Array.from(new Set(courses.flatMap((c) => c.tags))).sort(),
    [courses],
  );

  // Honor ?tag= deep links (e.g. from a course's "related topics").
  React.useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("tag");
    if (param && allTags.includes(param)) setTag(param);
  }, [allTags]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (tag && !c.tags.includes(tag)) return false;
      if (level !== "all" && c.level !== level) return false;
      if (delivery === "live" && !c.isLive) return false;
      if (delivery === "self" && c.isLive) return false;
      if (q) {
        const hay = `${c.title} ${c.blurb} ${c.instructor} ${c.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [courses, query, tag, level, delivery]);

  const hasFilters = !!query || !!tag || level !== "all" || delivery !== "all";

  function reset() {
    setQuery("");
    setTag(null);
    setLevel("all");
    setDelivery("all");
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Search + segmented filters */}
      <div className="flex flex-col gap-4 rounded-[18px] border border-border bg-bg-elevated/60 p-4 md:flex-row md:items-center md:gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-[12px] border border-border bg-bg-subtle px-3.5 focus-within:border-brand/50">
          <Search className="size-4 shrink-0 text-fg-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, topics, instructors…"
            aria-label="Search courses"
            className="h-11 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-fg-faint hover:text-fg"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Segmented
          label="Level"
          value={level}
          onChange={(v) => setLevel(v as LevelFilter)}
          options={[
            { value: "all", label: "All levels" },
            { value: "Beginner", label: "Beginner" },
            { value: "Intermediate", label: "Intermediate" },
            { value: "Advanced", label: "Advanced" },
          ]}
        />
        <Segmented
          label="Delivery"
          value={delivery}
          onChange={(v) => setDelivery(v as Delivery)}
          options={[
            { value: "all", label: "All" },
            { value: "live", label: "Live" },
            { value: "self", label: "Self-paced" },
          ]}
        />
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-faint">
            <SlidersHorizontal className="size-3.5" /> Topics:
          </span>
          {allTags.map((t) => {
            const active = tag === t;
            return (
              <button
                key={t}
                onClick={() => setTag(active ? null : t)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-brand/50 bg-brand/15 text-brand-glow"
                    : "border-border bg-bg-elevated text-fg-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "course" : "courses"}
          {hasFilters && " match your filters"}
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X className="size-4" /> Clear all
          </Button>
        )}
      </div>

      {/* Grid / empty state */}
      {filtered.length === 0 ? (
        <EmptyState onReset={reset} />
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((c) => (
              <motion.div
                key={c.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <CourseCard course={c} className="h-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function Segmented({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-1 overflow-x-auto rounded-[12px] border border-border bg-bg-subtle p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "whitespace-nowrap rounded-[9px] px-3 py-1.5 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-bg-elevated text-fg shadow-sm"
              : "text-fg-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[18px] border border-dashed border-border py-20 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-bg-subtle text-fg-faint">
        <Search className="size-6" />
      </span>
      <div>
        <p className="font-semibold text-fg">No courses match that</p>
        <p className="mt-1 text-sm text-fg-muted">
          Try a different topic or clear your filters.
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}
