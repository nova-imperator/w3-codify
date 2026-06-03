"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, User, CornerDownLeft } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Why is my useEffect running twice?",
  "Explain gradient descent simply",
  "Fix: list index out of range",
];

type Msg = { role: "user" | "ai"; text: string };

export function AiTutorTeaser() {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "ai", text: "Hi! I'm your AI mentor. Ask me any coding doubt — I'm here 24/7." },
  ]);
  const [streaming, setStreaming] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || streaming) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }, { role: "ai", text: "" }]);
    setStreaming(true);

    const setLast = (text: string) =>
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "ai", text };
        return copy;
      });

    // Streams a real Claude response (§8.5) via the public, rate-limited
    // /api/ai/explain endpoint; falls back to a mock stream without an API key.
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setLast(data.error ?? "Something went wrong — please try again.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setLast(acc);
      }
    } catch {
      setLast("Network hiccup — please try again.");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <section className="container-page py-20 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Copy */}
        <div className="flex flex-col gap-5">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              <span className="h-px w-6 bg-brand/60" />
              The differentiator
            </span>
          </Reveal>
          <Reveal delayIndex={1}>
            <h2 className="text-[length:var(--text-display-sm)] font-semibold">
              Stuck at 2AM? Your <GradientText>AI mentor</GradientText> never
              sleeps.
            </h2>
          </Reveal>
          <Reveal delayIndex={2}>
            <p className="max-w-lg text-base text-fg-muted md:text-lg">
              It sees your lesson and your code, explains concepts in plain
              English, fixes errors step-by-step, and reviews your projects —
              the moment you&apos;re stuck, not the next morning.
            </p>
          </Reveal>
          <Reveal delayIndex={3}>
            <ul className="flex flex-col gap-3 text-sm text-fg-muted">
              {[
                "Context-aware: knows what you're learning right now",
                "Coaches you to the answer — never just hands it over",
                "Available 24/7 across every lesson and project",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="grid size-5 place-items-center rounded-full bg-brand/15 text-brand">
                    <Sparkles className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Interactive demo */}
        <Reveal delayIndex={2}>
          <div className="glass relative overflow-hidden rounded-[20px] border-border-strong p-1.5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                <Sparkles className="size-3.5 text-brand" /> W3Codify AI Tutor
              </span>
            </div>

            <div
              ref={scrollRef}
              className="flex h-72 flex-col gap-3 overflow-y-auto rounded-[16px] bg-bg p-4"
            >
              {messages.map((m, i) => (
                <ChatBubble key={i} msg={m} />
              ))}
              {streaming && messages[messages.length - 1]?.text === "" && (
                <TypingDots />
              )}
            </div>

            <div className="p-2">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    disabled={streaming}
                    className="rounded-full border border-border bg-bg-elevated px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-brand/40 hover:text-fg disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
                className="flex items-center gap-2 rounded-[14px] border border-border bg-bg-subtle px-3 py-2 focus-within:border-brand/50"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a coding doubt…"
                  aria-label="Ask the AI tutor a coding doubt"
                  className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
                />
                <kbd className="hidden items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-fg-faint sm:flex">
                  <CornerDownLeft className="size-3" />
                </kbd>
                <Button type="submit" size="icon" className="size-9" disabled={streaming} aria-label="Send">
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ChatBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
    >
      <span
        className={cn(
          "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
          isUser ? "bg-bg-subtle text-fg-muted" : "bg-brand/15 text-brand",
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
      </span>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-[14px] px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-brand text-white"
            : "border border-border bg-bg-elevated text-fg",
        )}
      >
        <CodeAwareText text={msg.text} />
      </div>
    </motion.div>
  );
}

/** Renders ```code``` fences as monospace blocks; everything else as text. */
function CodeAwareText({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const code = part.replace(/```[a-z]*\n?/i, "").replace(/```$/, "");
          return (
            <pre
              key={i}
              className="my-2 overflow-x-auto rounded-[10px] border border-border bg-bg p-3 font-mono text-xs text-success"
            >
              <code>{code}</code>
            </pre>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 pl-10">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-fg-faint"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
