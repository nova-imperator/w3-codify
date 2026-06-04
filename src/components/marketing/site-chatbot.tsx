"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, User, X, Loader2, MessageCircle } from "lucide-react";
import { Markdown } from "@/components/shared/markdown";
import { Button } from "@/components/ui/button";
import { useFlags } from "@/components/providers/flags-provider";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

type Msg = { role: "user" | "ai"; text: string };

const GREETING: Msg = {
  role: "ai",
  text: "Hey! 👋 I'm the W3Codify assistant. Ask me **which course fits you**, how it works (everything's free right now), or any coding question.",
};

const SUGGESTIONS = [
  "Which course should I take?",
  "Is it really free?",
  "Explain async/await in JS",
];

export function SiteChatbot() {
  const pathname = usePathname();
  const { chatbot } = useFlags();
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([GREETING]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Hidden entirely when the chatbot feature flag is off.
  if (!chatbot) return null;
  // The in-classroom lesson player has its own context-aware AI Tutor dock,
  // so we don't stack a second assistant on top of it there.
  if (pathname?.startsWith("/classroom/")) return null;

  async function ask(question: string) {
    const q = question.trim();
    if (!q || streaming) return;
    setInput("");

    const history = messages
      .filter((_, i) => i !== 0) // drop the static greeting
      .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));

    setMessages((m) => [...m, { role: "user", text: q }, { role: "ai", text: "" }]);
    setStreaming(true);
    track("ask_ai", { surface: "site_chatbot" });

    const setLast = (text: string) =>
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "ai", text };
        return copy;
      });

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history: history.slice(-10) }),
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
    <>
      {/* Launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open W3Codify assistant"}
        aria-expanded={open}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-accent-grad fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full text-white shadow-[0_12px_40px_-8px_rgba(109,94,246,0.7)] motion-reduce:transition-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="W3Codify assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass fixed bottom-24 right-4 z-50 flex h-[min(70vh,560px)] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-[20px] border-border-strong shadow-2xl sm:right-5"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-border bg-bg-elevated/60 px-4 py-3">
              <span className="bg-accent-grad grid size-8 place-items-center rounded-full text-white">
                <Sparkles className="size-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-fg">W3Codify Assistant</p>
                <p className="text-[11px] text-fg-faint">Courses · pricing · coding help</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-bg-subtle"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-bg p-4">
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
                      "max-w-[85%] rounded-[14px] px-3.5 py-2.5",
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

            {/* Composer */}
            <div className="border-t border-border bg-bg-elevated/60 p-3">
              {messages.length === 1 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      disabled={streaming}
                      className="rounded-full border border-border bg-bg px-2.5 py-1 text-[11px] text-fg-muted transition-colors hover:border-brand/40 hover:text-fg disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
                className="flex items-center gap-2 rounded-[12px] border border-border bg-bg px-3 py-1.5 focus-within:border-brand/50"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  aria-label="Ask the W3Codify assistant"
                  className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
                />
                <Button type="submit" size="icon" className="size-8" disabled={streaming} aria-label="Send">
                  {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
