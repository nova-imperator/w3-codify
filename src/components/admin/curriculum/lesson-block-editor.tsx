"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Type,
  Code2,
  Image as ImageLucide,
  AlertCircle,
  HelpCircle,
  Video,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
} from "lucide-react";
import type { BlockType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MediaPicker, type MediaItem } from "./media-picker";
import { createBlock, updateBlock, deleteBlock, reorderBlocks } from "@/server/admin/actions";

type Block = {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  mediaId: string | null;
  media: MediaItem | null;
};

const TYPES: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: "TEXT", label: "Text", icon: Type },
  { type: "CODE", label: "Code", icon: Code2 },
  { type: "IMAGE", label: "Image", icon: ImageLucide },
  { type: "CALLOUT", label: "Callout", icon: AlertCircle },
  { type: "QUIZ", label: "Quiz", icon: HelpCircle },
  { type: "VIDEO", label: "Video", icon: Video },
];

export function LessonBlockEditor({
  lessonId,
  initialBlocks,
  media,
}: {
  lessonId: string;
  initialBlocks: Block[];
  media: MediaItem[];
}) {
  const [blocks, setBlocks] = React.useState<Block[]>(initialBlocks);
  const [, start] = React.useTransition();

  function patchLocal(id: string, patch: Partial<Block>) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  async function add(type: BlockType) {
    const res = await createBlock(lessonId, type);
    if (res.ok && res.data) {
      setBlocks((bs) => [
        ...bs,
        { id: res.data!.id, type, data: (res.data!.data as Record<string, unknown>) ?? {}, mediaId: null, media: null },
      ]);
    } else if (!res.ok) toast.error(res.error);
  }

  function save(id: string, data: Record<string, unknown>, mediaId?: string | null) {
    patchLocal(id, { data, ...(mediaId !== undefined ? { mediaId } : {}) });
    start(async () => {
      const res = await updateBlock(id, data, mediaId);
      if (!res.ok) toast.error(res.error);
    });
  }

  function remove(id: string) {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
    start(async () => {
      await deleteBlock(id);
    });
  }

  function move(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex((b) => b.id === id);
    const next = idx + dir;
    if (next < 0 || next >= blocks.length) return;
    const copy = [...blocks];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setBlocks(copy);
    start(async () => {
      await reorderBlocks(copy.map((b) => b.id));
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.length === 0 && (
        <p className="rounded-[10px] border border-dashed border-border px-4 py-6 text-center text-sm text-fg-faint">
          No content blocks yet. Add text, code, images, callouts or a quiz.
        </p>
      )}

      {blocks.map((block, i) => (
        <div key={block.id} className="rounded-[12px] border border-border bg-bg-subtle/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
              {block.type}
            </span>
            <div className="flex items-center gap-1">
              <IconBtn label="Move up" disabled={i === 0} onClick={() => move(block.id, -1)}>
                <ChevronUp className="size-4" />
              </IconBtn>
              <IconBtn label="Move down" disabled={i === blocks.length - 1} onClick={() => move(block.id, 1)}>
                <ChevronDown className="size-4" />
              </IconBtn>
              <IconBtn label="Delete block" onClick={() => remove(block.id)}>
                <Trash2 className="size-4 text-[#fb7185]" />
              </IconBtn>
            </div>
          </div>
          <BlockFields block={block} media={media} onSave={save} />
        </div>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="self-start">
            <Plus className="size-4" /> Add block
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {TYPES.map((t) => (
            <DropdownMenuItem key={t.type} onClick={() => add(t.type)}>
              <t.icon /> {t.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-7 place-items-center rounded-md text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg disabled:opacity-30"
    >
      {children}
    </button>
  );
}

const ta =
  "w-full resize-y rounded-[10px] border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-faint focus-visible:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

function BlockFields({
  block,
  media,
  onSave,
}: {
  block: Block;
  media: MediaItem[];
  onSave: (id: string, data: Record<string, unknown>, mediaId?: string | null) => void;
}) {
  const d = block.data ?? {};
  const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");

  if (block.type === "TEXT") {
    return (
      <textarea
        className={ta}
        rows={4}
        defaultValue={str("md")}
        placeholder="Write lesson text (markdown supported)…"
        onBlur={(e) => onSave(block.id, { md: e.target.value })}
      />
    );
  }

  if (block.type === "CODE") {
    return (
      <div className="flex flex-col gap-2">
        <Input
          defaultValue={str("lang") || "javascript"}
          placeholder="language"
          className="h-9 max-w-40"
          onBlur={(e) => onSave(block.id, { ...d, lang: e.target.value })}
        />
        <textarea
          className={`${ta} font-mono`}
          rows={5}
          defaultValue={str("code")}
          placeholder="// code…"
          onBlur={(e) => onSave(block.id, { ...d, code: e.target.value })}
        />
      </div>
    );
  }

  if (block.type === "CALLOUT") {
    return (
      <div className="flex flex-col gap-2">
        <select
          defaultValue={str("variant") || "info"}
          onChange={(e) => onSave(block.id, { ...d, variant: e.target.value })}
          className="h-9 max-w-40 rounded-[10px] border border-border bg-bg px-2.5 text-sm text-fg"
        >
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
        </select>
        <textarea
          className={ta}
          rows={3}
          defaultValue={str("md")}
          placeholder="Callout text…"
          onBlur={(e) => onSave(block.id, { ...d, md: e.target.value })}
        />
      </div>
    );
  }

  if (block.type === "IMAGE" || block.type === "VIDEO") {
    if (block.type === "VIDEO") {
      return (
        <Input
          defaultValue={str("url")}
          placeholder="https://… (Mux/YouTube/MP4)"
          onBlur={(e) => onSave(block.id, { url: e.target.value })}
        />
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {block.media ? (
            <div className="relative h-16 w-28 overflow-hidden rounded-[8px] border border-border">
              <Image src={block.media.url} alt="" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="grid h-16 w-28 place-items-center rounded-[8px] border border-dashed border-border text-fg-faint">
              <ImageLucide className="size-5" />
            </div>
          )}
          <MediaPicker
            media={media}
            selectedId={block.mediaId}
            onSelect={(m) => onSave(block.id, { ...d, alt: m.alt ?? "" }, m.id)}
            trigger={
              <Button type="button" variant="secondary" size="sm">
                {block.media ? "Change image" : "Pick image"}
              </Button>
            }
          />
        </div>
        <Input
          defaultValue={str("caption")}
          placeholder="Caption (optional)"
          className="h-9"
          onBlur={(e) => onSave(block.id, { ...d, caption: e.target.value })}
        />
      </div>
    );
  }

  if (block.type === "QUIZ") {
    const options = Array.isArray(d.options) ? (d.options as string[]) : ["", ""];
    return (
      <div className="flex flex-col gap-2">
        <Input
          defaultValue={str("question")}
          placeholder="Question"
          onBlur={(e) => onSave(block.id, { ...d, question: e.target.value })}
        />
        <textarea
          className={ta}
          rows={3}
          defaultValue={options.join("\n")}
          placeholder={"Option A\nOption B\nOption C"}
          onBlur={(e) =>
            onSave(block.id, { ...d, options: e.target.value.split("\n").filter(Boolean) })
          }
        />
        <label className="text-xs text-fg-muted">
          Correct option number (1-based)
          <Input
            type="number"
            min={1}
            defaultValue={typeof d.answer === "number" ? d.answer + 1 : 1}
            className="mt-1 h-9 max-w-24"
            onBlur={(e) => onSave(block.id, { ...d, answer: Math.max(0, Number(e.target.value) - 1) })}
          />
        </label>
      </div>
    );
  }

  return null;
}
