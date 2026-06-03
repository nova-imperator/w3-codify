"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ChevronRight,
  Clock,
  Eye,
  Save,
  Loader2,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminCard, EmptyState } from "@/components/admin/ui";
import { SortableList, SortableRow } from "./sortable";
import { LessonBlockEditor } from "./lesson-block-editor";
import type { MediaItem } from "./media-picker";
import {
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "@/server/admin/actions";
import { Layers } from "lucide-react";

type Block = {
  id: string;
  type: import("@prisma/client").BlockType;
  data: Record<string, unknown>;
  mediaId: string | null;
  media: MediaItem | null;
};
type Lesson = {
  id: string;
  title: string;
  durationSec: number;
  isFreePreview: boolean;
  videoUrl: string | null;
  blocks: Block[];
};
type Section = { id: string; title: string; lessons: Lesson[] };

export function CurriculumBuilder({
  courseId,
  initialSections,
  media,
}: {
  courseId: string;
  initialSections: Section[];
  media: MediaItem[];
}) {
  const [sections, setSections] = React.useState<Section[]>(initialSections);
  const [, start] = React.useTransition();

  async function addSection() {
    const res = await createSection(courseId, "New section");
    if (res.ok && res.data) {
      setSections((s) => [...s, { id: res.data!.id, title: "New section", lessons: [] }]);
    } else if (!res.ok) toast.error(res.error);
  }

  function renameSection(id: string, title: string) {
    setSections((s) => s.map((x) => (x.id === id ? { ...x, title } : x)));
    start(async () => {
      await updateSection(id, title);
    });
  }

  function removeSection(id: string, title: string) {
    if (!confirm(`Delete section "${title}" and its lessons?`)) return;
    setSections((s) => s.filter((x) => x.id !== id));
    start(async () => {
      await deleteSection(id);
    });
  }

  function reorderSecs(ids: string[]) {
    setSections((s) => ids.map((id) => s.find((x) => x.id === id)!).filter(Boolean));
    start(async () => {
      await reorderSections(ids);
    });
  }

  function setLessons(sectionId: string, updater: (l: Lesson[]) => Lesson[]) {
    setSections((s) => s.map((x) => (x.id === sectionId ? { ...x, lessons: updater(x.lessons) } : x)));
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.length === 0 ? (
        <EmptyState icon={Layers} title="No sections yet" description="Build the curriculum: add sections, then lessons and content.">
          <Button className="mt-2" onClick={addSection}>
            <Plus className="size-4" /> Add section
          </Button>
        </EmptyState>
      ) : (
        <SortableList items={sections} onReorder={reorderSecs}>
          {(section) => (
            <SortableRow id={section.id} className="mb-4">
              {(handle) => (
                <SectionCard
                  section={section}
                  handle={handle}
                  media={media}
                  onRename={(t) => renameSection(section.id, t)}
                  onDelete={() => removeSection(section.id, section.title)}
                  setLessons={(u) => setLessons(section.id, u)}
                />
              )}
            </SortableRow>
          )}
        </SortableList>
      )}

      {sections.length > 0 && (
        <Button variant="secondary" onClick={addSection} className="self-start">
          <Plus className="size-4" /> Add section
        </Button>
      )}
    </div>
  );
}

function SectionCard({
  section,
  handle,
  media,
  onRename,
  onDelete,
  setLessons,
}: {
  section: Section;
  handle: React.ReactNode;
  media: MediaItem[];
  onRename: (title: string) => void;
  onDelete: () => void;
  setLessons: (updater: (l: Lesson[]) => Lesson[]) => void;
}) {
  async function addLesson() {
    const res = await createLesson(section.id, "New lesson");
    if (res.ok && res.data) {
      setLessons((l) => [
        ...l,
        { id: res.data!.id, title: "New lesson", durationSec: 0, isFreePreview: false, videoUrl: null, blocks: [] },
      ]);
    } else if (!res.ok) toast.error(res.error);
  }

  function reorder(ids: string[]) {
    setLessons((l) => ids.map((id) => l.find((x) => x.id === id)!).filter(Boolean));
    reorderLessons(ids);
  }

  const totalSec = section.lessons.reduce((s, l) => s + l.durationSec, 0);

  return (
    <AdminCard className="p-4">
      <div className="flex items-center gap-3">
        {handle}
        <Input
          defaultValue={section.title}
          onBlur={(e) => onRename(e.target.value)}
          className="h-10 flex-1 font-medium"
        />
        <span className="hidden whitespace-nowrap text-xs text-fg-faint sm:inline">
          {section.lessons.length} lessons · {formatDuration(totalSec)}
        </span>
        <button onClick={onDelete} aria-label="Delete section" className="grid size-9 place-items-center rounded-md text-fg-muted hover:bg-bg-subtle hover:text-[#fb7185]">
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2 pl-2 sm:pl-7">
        {section.lessons.length > 0 && (
          <SortableList items={section.lessons} onReorder={reorder}>
            {(lesson) => (
              <SortableRow id={lesson.id} className="mb-2">
                {(lhandle) => (
                  <LessonRow
                    lesson={lesson}
                    handle={lhandle}
                    media={media}
                    onChange={(patch) => setLessons((ls) => ls.map((x) => (x.id === lesson.id ? { ...x, ...patch } : x)))}
                    onDelete={() => setLessons((ls) => ls.filter((x) => x.id !== lesson.id))}
                  />
                )}
              </SortableRow>
            )}
          </SortableList>
        )}
        <Button variant="ghost" size="sm" onClick={addLesson} className="self-start text-fg-muted">
          <Plus className="size-4" /> Add lesson
        </Button>
      </div>
    </AdminCard>
  );
}

function LessonRow({
  lesson,
  handle,
  media,
  onChange,
  onDelete,
}: {
  lesson: Lesson;
  handle: React.ReactNode;
  media: MediaItem[];
  onChange: (patch: Partial<Lesson>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [title, setTitle] = React.useState(lesson.title);
  const [minutes, setMinutes] = React.useState(Math.round(lesson.durationSec / 60));
  const [free, setFree] = React.useState(lesson.isFreePreview);
  const [videoUrl, setVideoUrl] = React.useState(lesson.videoUrl ?? "");

  async function saveDetails() {
    setSaving(true);
    const res = await updateLesson(lesson.id, {
      title,
      durationSec: minutes * 60,
      isFreePreview: free,
      videoUrl,
    });
    setSaving(false);
    if (res.ok) {
      onChange({ title, durationSec: minutes * 60, isFreePreview: free, videoUrl });
      toast.success("Lesson saved");
    } else toast.error(res.error);
  }

  function remove() {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    onDelete();
    deleteLesson(lesson.id);
  }

  return (
    <div className="rounded-[10px] border border-border bg-bg">
      <div className="flex items-center gap-3 px-3 py-2.5">
        {handle}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <ChevronRight className={cn("size-4 shrink-0 text-fg-faint transition-transform", open && "rotate-90")} />
          <span className="truncate text-sm text-fg">{lesson.title}</span>
        </button>
        {lesson.isFreePreview && (
          <span className="hidden items-center gap-1 text-xs text-brand sm:inline-flex">
            <Eye className="size-3" /> Free
          </span>
        )}
        <span className="hidden items-center gap-1 text-xs text-fg-faint sm:inline-flex">
          <Clock className="size-3" /> {formatDuration(lesson.durationSec)}
        </span>
        <button onClick={remove} aria-label="Delete lesson" className="grid size-8 place-items-center rounded-md text-fg-muted hover:bg-bg-subtle hover:text-[#fb7185]">
          <Trash2 className="size-4" />
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-4 border-t border-border p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-fg-muted">Lesson title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-fg-muted">Minutes</label>
              <Input type="number" min={0} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="h-9" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-fg-muted">Video URL (optional)</label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" className="h-9" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-sm text-fg-muted">
              <Checkbox checked={free} onCheckedChange={(v) => setFree(!!v)} /> Free preview
            </label>
            <Button size="sm" onClick={saveDetails} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save className="size-3.5" />}
              Save lesson
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-faint">
              Lesson content
            </p>
            <LessonBlockEditor lessonId={lesson.id} initialBlocks={lesson.blocks} media={media} />
          </div>
        </div>
      )}
    </div>
  );
}
