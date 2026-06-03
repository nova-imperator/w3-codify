"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Play, Loader2, Share2, Terminal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(() => import("./code-editor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-fg-faint">
      <Loader2 className="size-5 animate-spin" />
    </div>
  ),
});

type Lang = "python" | "javascript";
type RunResult = { stdout: string; stderr: string; exitCode: number | null; timeMs: number | null; provider: string };

const STARTERS: Record<Lang, string> = {
  python: `# Python scratchpad — write code, hit Run.\nname = input("Your name: ") or "world"\nprint(f"Hello, {name}!")\n`,
  javascript: `// JavaScript scratchpad — write code, hit Run.\nconst name = require("fs").readFileSync(0, "utf8").trim() || "world";\nconsole.log(\`Hello, \${name}!\`);\n`,
};

function decodeHash(): { lang?: Lang; code?: string } {
  if (typeof window === "undefined") return {};
  const h = new URLSearchParams(window.location.hash.slice(1));
  const lang = h.get("lang");
  const code = h.get("code");
  try {
    return {
      lang: lang === "python" || lang === "javascript" ? lang : undefined,
      code: code ? decodeURIComponent(escape(atob(code))) : undefined,
    };
  } catch {
    return {};
  }
}

export function Playground() {
  const [lang, setLang] = React.useState<Lang>("python");
  const [code, setCode] = React.useState(STARTERS.python);
  const [stdin, setStdin] = React.useState("");
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<RunResult | null>(null);

  // Restore a shared snippet from the URL hash on first load.
  React.useEffect(() => {
    const { lang: l, code: c } = decodeHash();
    if (l) setLang(l);
    if (c) setCode(c);
  }, []);

  function switchLang(l: Lang) {
    setLang(l);
    // Only replace with the starter if the buffer is still a known starter.
    if (code.trim() === "" || code === STARTERS.python || code === STARTERS.javascript) {
      setCode(STARTERS[l]);
    }
  }

  async function run() {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "run", language: lang, source: code, stdin }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't run your code.");
        return;
      }
      setResult(data.result);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setRunning(false);
    }
  }

  function share() {
    const b64 = btoa(unescape(encodeURIComponent(code)));
    const url = `${window.location.origin}/playground#lang=${lang}&code=${b64}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Shareable link copied to clipboard"),
      () => toast.error("Couldn't copy the link"),
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Editor */}
      <div className="flex flex-col overflow-hidden rounded-[16px] border border-border bg-[#0b0d18]">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div className="flex gap-1">
            {(["python", "javascript"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  lang === l ? "bg-brand/15 text-brand" : "text-fg-muted hover:text-fg",
                )}
              >
                {l === "python" ? "Python" : "JavaScript"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={share} aria-label="Share">
              <Share2 className="size-4" /> Share
            </Button>
            <Button size="sm" onClick={run} disabled={running}>
              {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              Run
            </Button>
          </div>
        </div>
        <div className="h-[52vh] min-h-[320px]">
          <CodeEditor language={lang} value={code} onChange={setCode} />
        </div>
      </div>

      {/* Console */}
      <div className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-[16px] border border-border bg-bg-elevated">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-fg">
            <Terminal className="size-4 text-brand" /> Output
            {result && (
              <span className="ml-auto text-xs text-fg-faint">
                exit {result.exitCode ?? "—"}
                {result.timeMs != null ? ` · ${result.timeMs}ms` : ""} · {result.provider}
              </span>
            )}
          </div>
          <pre className="max-h-[34vh] min-h-[140px] overflow-auto whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed">
            {running ? (
              <span className="text-fg-faint">Running…</span>
            ) : result ? (
              <>
                {result.stdout && <span className="text-fg">{result.stdout}</span>}
                {result.stderr && <span className="text-[#fb7185]">{result.stderr}</span>}
                {!result.stdout && !result.stderr && <span className="text-fg-faint">(no output)</span>}
              </>
            ) : (
              <span className="text-fg-faint">Output appears here. Press Run.</span>
            )}
          </pre>
        </div>

        <div className="overflow-hidden rounded-[16px] border border-border bg-bg-elevated">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-medium text-fg">Standard input (stdin)</span>
            {stdin && (
              <button onClick={() => setStdin("")} className="inline-flex items-center gap-1 text-xs text-fg-faint hover:text-fg">
                <RotateCcw className="size-3" /> clear
              </button>
            )}
          </div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Optional input passed to your program's stdin…"
            className="h-24 w-full resize-none bg-transparent p-4 font-mono text-[13px] text-fg outline-none placeholder:text-fg-faint"
          />
        </div>
      </div>
    </div>
  );
}
