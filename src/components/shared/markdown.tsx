import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal, dependency-free Markdown renderer for lesson text and AI messages.
 * Supports fenced code blocks, inline `code`, **bold**, bullet lists, and
 * paragraphs. Renders plain text (no raw HTML) so it's XSS-safe.
 */
export function Markdown({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className={cn("flex flex-col gap-3 text-sm leading-relaxed text-fg-muted", className)}>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const body = part.replace(/^```[a-zA-Z0-9]*\n?/, "").replace(/```$/, "");
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-[10px] border border-border bg-bg p-3 font-mono text-xs text-success"
            >
              <code>{body}</code>
            </pre>
          );
        }
        return <Blocks key={i} text={part} />;
      })}
    </div>
  );
}

function Blocks({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length) {
      out.push(
        <ul key={`ul-${key++}`} className="flex list-disc flex-col gap-1 pl-5">
          {list.map((li, i) => (
            <li key={i}><Inline text={li} /></li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      list.push(line.replace(/^\s*[-*]\s+/, ""));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      out.push(<p key={`p-${key++}`}><Inline text={line} /></p>);
    }
  }
  flushList();
  return <>{out}</>;
}

function Inline({ text }: { text: string }) {
  // Split on `code`, **bold**, and [label](href) links, keeping delimiters.
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {tokens.map((t, i) => {
        if (t.startsWith("`") && t.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-bg-subtle px-1.5 py-0.5 font-mono text-[0.85em] text-brand-glow">
              {t.slice(1, -1)}
            </code>
          );
        }
        if (t.startsWith("**") && t.endsWith("**")) {
          return <strong key={i} className="font-semibold text-fg">{t.slice(2, -2)}</strong>;
        }
        const link = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const [, label, href] = link;
          // XSS-safe: only allow internal paths or http(s) — never javascript:, etc.
          const safe = href.startsWith("/") || /^https?:\/\//i.test(href);
          if (safe) {
            const external = /^https?:\/\//i.test(href);
            return (
              <a
                key={i}
                href={href}
                className="font-medium text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {label}
              </a>
            );
          }
          return <React.Fragment key={i}>{label}</React.Fragment>;
        }
        return <React.Fragment key={i}>{t}</React.Fragment>;
      })}
    </>
  );
}
