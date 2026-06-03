"use client";

import * as React from "react";
import { Sparkles, Send, User, Loader2 } from "lucide-react";
import { Markdown } from "@/components/shared/markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "ai"; text: string };

export function AiTutorPanel({
  courseId,
  lessonId,
  lessonTitle,
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
}) {
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      role: "ai",
      text: `Hi! I'm your AI tutor. Ask me anything about **${lessonTitle}** — concepts, errors, or your code.`,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const threadRef = React.useRef<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }, { role: "ai", text: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          threadId: threadRef.current ?? undefined,
          courseId,
          lessonId,
        }),
      });
      const tid = res.headers.get("X-Thread-Id");
      if (tid) threadRef.current = tid;

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        updateLast(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        updateLast(acc);
      }
    } catch {
      updateLast("Network error. Please try again.");
    } finally {
      setStreaming(false);
    }
  }

  function updateLast(text: string) {
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { role: "ai", text };
      return copy;
    });
  }

  const suggestions = [
    "Explain this lesson simply",
    "Give me a quick example",
    "Quiz me on this",
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="grid size-7 place-items-center rounded-full bg-brand/15 text-brand">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-fg">AI Tutor</p>
          <p className="text-[11px] text-fg-faint">Knows this lesson · 24/7</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
            <span
              className={cn(
                "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
                m.role === "user" ? "bg-bg-subtle text-fg-muted" : "bg-brand/15 text-brand",
              )}
            >
              {m.role === "user" ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
            </span>
            <div
              className={cn(
                "max-w-[88%] rounded-[14px] px-3.5 py-2.5",
                m.role === "user" ? "bg-brand text-white" : "border border-border bg-bg-elevated",
              )}
            >
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap text-sm">{m.text}</p>
              ) : m.text ? (
                <Markdown text={m.text} />
              ) : (
                <Loader2 className="size-4 animate-spin text-fg-faint" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={streaming}
              className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-[11px] text-fg-muted hover:border-brand/40 hover:text-fg disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 rounded-[12px] border border-border bg-bg-subtle px-3 py-1.5 focus-within:border-brand/50"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this lesson…"
            aria-label="Ask the AI tutor"
            className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
          />
          <Button type="submit" size="icon" className="size-8" disabled={streaming} aria-label="Send">
            {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
