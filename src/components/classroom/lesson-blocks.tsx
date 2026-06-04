"use client";

import * as React from "react";
import Image from "next/image";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  Check,
  X,
  FileDown,
  Copy,
  Maximize2,
  HelpCircle,
} from "lucide-react";
import { Markdown } from "@/components/shared/markdown";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type RenderBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  media: { url: string; alt: string | null } | null;
};

export type QuizState = Record<string, { picked: number; correct: boolean }>;

export function LessonBlocks({
  blocks,
  savedQuiz,
  onQuiz,
}: {
  blocks: RenderBlock[];
  savedQuiz?: QuizState;
  onQuiz?: (blockId: string, picked: number, correct: boolean) => void;
}) {
  if (blocks.length === 0) {
    return (
      <p className="rounded-[12px] border border-dashed border-border px-4 py-8 text-center text-sm text-fg-faint">
        This lesson&apos;s content is being prepared. Check back soon.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b) => (
        <Block key={b.id} block={b} saved={savedQuiz?.[b.id]} onQuiz={onQuiz} />
      ))}
    </div>
  );
}

function str(d: Record<string, unknown>, k: string): string {
  return typeof d[k] === "string" ? (d[k] as string) : "";
}

function Block({
  block,
  saved,
  onQuiz,
}: {
  block: RenderBlock;
  saved?: { picked: number; correct: boolean };
  onQuiz?: (blockId: string, picked: number, correct: boolean) => void;
}) {
  const d = block.data ?? {};
  switch (block.type) {
    // Legacy CODE_EXERCISE blocks (the runnable editor is gone): render the
    // exercise's starter code as a plain, read-only syntax-highlighted snippet.
    case "CODE_EXERCISE":
      return <CodeBlock lang={str(d, "language") || str(d, "lang")} code={str(d, "starterCode") || str(d, "code")} />;
    case "TEXT":
      return <Markdown text={str(d, "md")} className="text-base" />;
    case "CODE":
      return <CodeBlock lang={str(d, "lang")} code={str(d, "code")} />;
    case "IMAGE":
      return <ImageBlock url={block.media?.url} alt={block.media?.alt ?? str(d, "alt")} caption={str(d, "caption")} />;
    case "CALLOUT":
      return <Callout variant={str(d, "variant") || "info"} md={str(d, "md")} />;
    case "QUIZ":
      return <Quiz id={block.id} data={d} saved={saved} onQuiz={onQuiz} />;
    case "VIDEO":
    case "EMBED": {
      const url = str(d, "url");
      if (!url) return null;
      return (
        <div className="aspect-video overflow-hidden rounded-[14px] border border-border bg-black">
          <iframe
            src={url}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Lesson media"
          />
        </div>
      );
    }
    case "FILE":
      return <DocBlock url={block.media?.url} label={str(d, "label") || block.media?.alt || "Download notes"} />;
    default:
      return null;
  }
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="overflow-hidden rounded-[12px] border border-border">
      <div className="flex items-center justify-between border-b border-border bg-bg-subtle px-4 py-1.5">
        <span className="font-mono text-xs text-fg-faint">{lang || "code"}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="inline-flex items-center gap-1 text-xs text-fg-muted transition-colors hover:text-fg"
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-bg p-4 font-mono text-sm text-accent">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ImageBlock({ url, alt, caption }: { url?: string; alt?: string; caption?: string }) {
  const [failed, setFailed] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  if (!url) return null;

  const frame = (
    <div className="relative aspect-video overflow-hidden rounded-[14px] border border-border bg-bg-subtle">
      {failed ? (
        <div className="bg-accent-grad grid h-full w-full place-items-center p-6 text-center">
          <span className="font-display text-lg font-semibold text-white/90 drop-shadow">
            {caption || alt || "Study diagram"}
          </span>
        </div>
      ) : (
        <Image
          src={url}
          alt={alt ?? caption ?? ""}
          fill
          className="object-contain"
          unoptimized
          onError={() => setFailed(true)}
        />
      )}
      <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-md bg-black/50 text-white/90 opacity-0 transition-opacity group-hover/img:opacity-100">
        <Maximize2 className="size-3.5" />
      </span>
    </div>
  );

  return (
    <figure className="flex flex-col gap-2">
      <button className="group/img block w-full" onClick={() => setOpen(true)} aria-label="Open image">
        {frame}
      </button>
      {caption && <figcaption className="text-center text-xs text-fg-faint">{caption}</figcaption>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl border-border-strong p-2">
          <DialogTitle className="sr-only">{caption || alt || "Lesson image"}</DialogTitle>
          <div className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-bg">
            {failed ? (
              <div className="bg-accent-grad grid h-full w-full place-items-center p-6 text-center">
                <span className="font-display text-2xl font-semibold text-white/90">{caption || alt}</span>
              </div>
            ) : (
              <Image src={url} alt={alt ?? ""} fill className="object-contain" unoptimized />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </figure>
  );
}

function DocBlock({ url, label }: { url?: string; label: string }) {
  if (!url) return null;
  const isPdf = url.toLowerCase().endsWith(".pdf");
  return (
    <a
      href={url}
      target="_blank"
      download
      className="inline-flex w-fit items-center gap-3 rounded-[12px] border border-border bg-bg-elevated px-4 py-3 text-sm transition-colors hover:border-brand/40"
    >
      <span className="grid size-9 place-items-center rounded-[10px] bg-brand/12 text-brand">
        <FileDown className="size-4.5" />
      </span>
      <span>
        <span className="block font-medium text-fg">{label}</span>
        <span className="block text-xs text-fg-faint">{isPdf ? "PDF" : "Notes"} · downloadable</span>
      </span>
    </a>
  );
}

function Callout({ variant, md }: { variant: string; md: string }) {
  const map: Record<string, { icon: React.ElementType; cls: string }> = {
    info: { icon: Info, cls: "border-brand/30 bg-brand/8 text-brand-glow" },
    success: { icon: CheckCircle2, cls: "border-success/30 bg-success/8 text-success" },
    warning: { icon: AlertTriangle, cls: "border-[#f5a623]/30 bg-[#f5a623]/8 text-[#f5a623]" },
  };
  const { icon: Icon, cls } = map[variant] ?? map.info;
  return (
    <div className={cn("flex gap-3 rounded-[12px] border p-4", cls)}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <Markdown text={md} className="text-fg" />
    </div>
  );
}

function Quiz({
  id,
  data,
  saved,
  onQuiz,
}: {
  id: string;
  data: Record<string, unknown>;
  saved?: { picked: number; correct: boolean };
  onQuiz?: (blockId: string, picked: number, correct: boolean) => void;
}) {
  const question = typeof data.question === "string" ? data.question : "";
  const options = Array.isArray(data.options) ? (data.options as string[]) : [];
  const answer = typeof data.answer === "number" ? data.answer : 0;
  const why = typeof data.why === "string" ? data.why : "";
  const [picked, setPicked] = React.useState<number | null>(saved ? saved.picked : null);
  const show = picked !== null;

  function choose(i: number) {
    if (show) return;
    setPicked(i);
    onQuiz?.(id, i, i === answer);
  }

  return (
    <div className="rounded-[14px] border border-brand/25 bg-brand/[0.04] p-5">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
        <HelpCircle className="size-3.5" /> Checkpoint
      </p>
      <p className="mb-3 font-medium text-fg">{question || "Quick check"}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === answer;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={show}
              className={cn(
                "flex items-center justify-between gap-3 rounded-[10px] border px-4 py-2.5 text-left text-sm transition-colors",
                !show && "border-border bg-bg-subtle hover:border-brand/40",
                show && isCorrect && "border-success/50 bg-success/10 text-fg",
                show && isPicked && !isCorrect && "border-[#fb7185]/50 bg-[#fb7185]/10 text-fg",
                show && !isPicked && !isCorrect && "border-border opacity-60",
              )}
            >
              {opt}
              {show && isCorrect && <Check className="size-4 text-success" />}
              {show && isPicked && !isCorrect && <X className="size-4 text-[#fb7185]" />}
            </button>
          );
        })}
      </div>
      {show && (
        <div className="mt-3 rounded-[10px] bg-bg-subtle/60 p-3 text-sm">
          <p className={picked === answer ? "font-medium text-success" : "font-medium text-[#fb7185]"}>
            {picked === answer ? "Correct!" : "Not quite."}
          </p>
          {why && <p className="mt-1 text-fg-muted">{why}</p>}
        </div>
      )}
    </div>
  );
}
