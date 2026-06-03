"use client";

import * as React from "react";
import Image from "next/image";
import { Info, CheckCircle2, AlertTriangle, Check, X, FileDown } from "lucide-react";
import { Markdown } from "@/components/shared/markdown";
import { cn } from "@/lib/utils";

export type RenderBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  media: { url: string; alt: string | null } | null;
};

export function LessonBlocks({ blocks }: { blocks: RenderBlock[] }) {
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
        <Block key={b.id} block={b} />
      ))}
    </div>
  );
}

function str(d: Record<string, unknown>, k: string): string {
  return typeof d[k] === "string" ? (d[k] as string) : "";
}

function Block({ block }: { block: RenderBlock }) {
  const d = block.data ?? {};
  switch (block.type) {
    case "TEXT":
      return <Markdown text={str(d, "md")} className="text-base" />;

    case "CODE":
      return (
        <div className="overflow-hidden rounded-[12px] border border-border">
          {str(d, "lang") && (
            <div className="border-b border-border bg-bg-subtle px-4 py-1.5 font-mono text-xs text-fg-faint">
              {str(d, "lang")}
            </div>
          )}
          <pre className="overflow-x-auto bg-bg p-4 font-mono text-sm text-success">
            <code>{str(d, "code")}</code>
          </pre>
        </div>
      );

    case "IMAGE":
      return block.media ? (
        <figure className="flex flex-col gap-2">
          <div className="relative aspect-video overflow-hidden rounded-[14px] border border-border bg-bg-subtle">
            <Image
              src={block.media.url}
              alt={block.media.alt ?? str(d, "caption") ?? ""}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          {str(d, "caption") && (
            <figcaption className="text-center text-xs text-fg-faint">
              {str(d, "caption")}
            </figcaption>
          )}
        </figure>
      ) : null;

    case "CALLOUT":
      return <Callout variant={str(d, "variant") || "info"} md={str(d, "md")} />;

    case "QUIZ":
      return <Quiz data={d} />;

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
      return block.media ? (
        <a
          href={block.media.url}
          target="_blank"
          className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-border bg-bg-elevated px-4 py-2.5 text-sm text-fg hover:border-brand/40"
        >
          <FileDown className="size-4 text-brand" /> Download resource
        </a>
      ) : null;

    default:
      return null;
  }
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

function Quiz({ data }: { data: Record<string, unknown> }) {
  const question = typeof data.question === "string" ? data.question : "";
  const options = Array.isArray(data.options) ? (data.options as string[]) : [];
  const answer = typeof data.answer === "number" ? data.answer : 0;
  const [picked, setPicked] = React.useState<number | null>(null);

  return (
    <div className="rounded-[14px] border border-border bg-bg-elevated p-5">
      <p className="mb-3 font-medium text-fg">{question || "Quick check"}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === answer;
          const show = picked !== null;
          return (
            <button
              key={i}
              onClick={() => setPicked(i)}
              disabled={show}
              className={cn(
                "flex items-center justify-between gap-3 rounded-[10px] border px-4 py-2.5 text-left text-sm transition-colors",
                !show && "border-border bg-bg-subtle hover:border-brand/40",
                show && isCorrect && "border-success/50 bg-success/10 text-fg",
                show && isPicked && !isCorrect && "border-[#ff3b3b]/50 bg-[#ff3b3b]/10 text-fg",
                show && !isPicked && !isCorrect && "border-border opacity-60",
              )}
            >
              {opt}
              {show && isCorrect && <Check className="size-4 text-success" />}
              {show && isPicked && !isCorrect && <X className="size-4 text-[#ff6b6b]" />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="mt-3 text-sm text-fg-muted">
          {picked === answer ? "✅ Correct!" : "Not quite — review the lesson and try again."}
        </p>
      )}
    </div>
  );
}
