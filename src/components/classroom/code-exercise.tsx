"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  FlaskConical,
  Terminal,
  Circle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/shared/markdown";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(() => import("@/components/playground/code-editor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-fg-faint">
      <Loader2 className="size-5 animate-spin" />
    </div>
  ),
});

export type ExerciseTest = { name: string; input?: string; expected?: string; hidden: boolean };
export type ExerciseData = {
  language: "python" | "javascript";
  starterCode: string;
  instructions: string;
  tests: ExerciseTest[];
};
type RunResult = { stdout: string; stderr: string; exitCode: number | null; timeMs: number | null; provider: string };
type CaseResult = { name: string; passed: boolean; hidden: boolean };

export function CodeExercise({
  blockId,
  courseId,
  lessonId,
  data,
  savedCode,
  savedPassed,
  onResult,
}: {
  blockId: string;
  courseId: string;
  lessonId: string;
  data: ExerciseData;
  savedCode?: string;
  savedPassed?: boolean;
  onResult?: (r: { passed: boolean; passedCount: number; totalCount: number; lessonCompleted: boolean; score?: { correct: number; total: number } }) => void;
}) {
  const [code, setCode] = React.useState(savedCode ?? data.starterCode);
  const [tab, setTab] = React.useState<"tests" | "console" | "hint">("tests");
  const [running, setRunning] = React.useState(false);
  const [grading, setGrading] = React.useState(false);
  const [run, setRun] = React.useState<RunResult | null>(null);
  const [cases, setCases] = React.useState<CaseResult[] | null>(null);
  const [passed, setPassed] = React.useState(!!savedPassed);
  const [hint, setHint] = React.useState("");
  const [hinting, setHinting] = React.useState(false);

  const langLabel = data.language === "python" ? "Python" : "JavaScript";

  async function doRun() {
    if (running || grading) return;
    setRunning(true);
    setTab("console");
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "run", language: data.language, source: code }),
      });
      const json = await res.json();
      if (!res.ok) return toast.error(json.error ?? "Couldn't run your code.");
      setRun(json.result);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setRunning(false);
    }
  }

  async function doSubmit() {
    if (running || grading) return;
    setGrading(true);
    setTab("tests");
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "grade", courseId, lessonId, blockId, source: code }),
      });
      const json = await res.json();
      if (!res.ok) return toast.error(json.error ?? "Couldn't grade your code.");
      setCases(json.results);
      setRun(json.run);
      setPassed(json.passed);
      onResult?.({
        passed: json.passed,
        passedCount: json.passedCount,
        totalCount: json.totalCount,
        lessonCompleted: json.lessonCompleted,
        score: json.score,
      });
      if (json.passed) toast.success(`All ${json.totalCount} tests passed! 🎉`);
      else toast.error(`${json.passedCount}/${json.totalCount} tests passed — keep going.`);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setGrading(false);
    }
  }

  async function askTutor() {
    if (hinting) return;
    setHinting(true);
    setHint("");
    setTab("hint");
    const outcome = run
      ? `When run, the output was:\n${(run.stdout || "") + (run.stderr ? "\n[errors]\n" + run.stderr : "")}`
      : "I haven't run it yet.";
    const message = `I'm doing a ${langLabel} exercise. Give me a HINT (do not write the full solution) toward fixing my code.\n\nInstructions:\n${data.instructions}\n\nMy code:\n\`\`\`${data.language}\n${code}\n\`\`\`\n\n${outcome}`;
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({}));
        setHint(d.error ?? "Couldn't reach the AI tutor — try again.");
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setHint(acc);
      }
    } catch {
      setHint("Network error — please try again.");
    } finally {
      setHinting(false);
    }
  }

  const visibleTests = data.tests.filter((t) => !t.hidden);
  const hiddenCount = data.tests.length - visibleTests.length;

  return (
    <div className="overflow-hidden rounded-[16px] border border-brand/25 bg-brand/[0.03]">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
          <FlaskConical className="size-3.5" /> Code exercise · {langLabel}
        </span>
        {passed && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" /> Passed
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCode(data.starterCode)} aria-label="Reset code">
            <RotateCcw className="size-4" /> Reset
          </Button>
          <Button variant="secondary" size="sm" onClick={doRun} disabled={running || grading}>
            {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />} Run
          </Button>
          <Button size="sm" onClick={doSubmit} disabled={running || grading}>
            {grading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Submit
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="border-b border-border px-4 py-3">
        <Markdown text={data.instructions} />
      </div>

      {/* Split: editor + panel */}
      <div className="grid lg:grid-cols-2">
        <div className="h-[44vh] min-h-[300px] border-b border-border lg:border-b-0 lg:border-r">
          <CodeEditor language={data.language} value={code} onChange={setCode} />
        </div>

        <div className="flex h-[44vh] min-h-[300px] flex-col">
          {/* tabs */}
          <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
            <TabBtn active={tab === "tests"} onClick={() => setTab("tests")} icon={FlaskConical}>
              Tests
            </TabBtn>
            <TabBtn active={tab === "console"} onClick={() => setTab("console")} icon={Terminal}>
              Console
            </TabBtn>
            <TabBtn active={tab === "hint"} onClick={() => setTab("hint")} icon={Sparkles}>
              AI Hint
            </TabBtn>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={askTutor} disabled={hinting}>
              {hinting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Ask AI Tutor
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 text-sm">
            {tab === "tests" && (
              <TestList visible={visibleTests} hiddenCount={hiddenCount} cases={cases} />
            )}
            {tab === "console" && (
              <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
                {running ? (
                  <span className="text-fg-faint">Running…</span>
                ) : run ? (
                  <>
                    {run.stdout && <span className="text-fg">{run.stdout}</span>}
                    {run.stderr && <span className="text-[#fb7185]">{run.stderr}</span>}
                    {!run.stdout && !run.stderr && <span className="text-fg-faint">(no output)</span>}
                  </>
                ) : (
                  <span className="text-fg-faint">Press Run to execute your code.</span>
                )}
              </pre>
            )}
            {tab === "hint" && (
              <div>
                {hint ? (
                  <Markdown text={hint} />
                ) : (
                  <p className="text-fg-faint">
                    Stuck? Tap <span className="text-brand">Ask AI Tutor</span> for a hint — it coaches, it
                    won&apos;t hand over the answer.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-brand/15 text-brand" : "text-fg-muted hover:text-fg",
      )}
    >
      <Icon className="size-3.5" /> {children}
    </button>
  );
}

function TestList({
  visible,
  hiddenCount,
  cases,
}: {
  visible: ExerciseTest[];
  hiddenCount: number;
  cases: CaseResult[] | null;
}) {
  const byName = new Map((cases ?? []).map((c) => [c.name, c]));
  return (
    <div className="flex flex-col gap-2">
      {visible.map((t, i) => {
        const r = byName.get(t.name) ?? (cases ? [...byName.values()][i] : undefined);
        return (
          <div key={i} className="rounded-[10px] border border-border bg-bg-elevated p-3">
            <div className="flex items-center gap-2">
              <ResultIcon result={r} />
              <span className="text-sm font-medium text-fg">{t.name}</span>
            </div>
            {(t.input || t.expected) && (
              <div className="mt-2 grid gap-1 font-mono text-xs text-fg-muted">
                {t.input != null && <div>input: <span className="text-fg">{JSON.stringify(t.input)}</span></div>}
                {t.expected != null && <div>expected: <span className="text-fg">{JSON.stringify(t.expected)}</span></div>}
              </div>
            )}
          </div>
        );
      })}
      {hiddenCount > 0 && (
        <div className="rounded-[10px] border border-dashed border-border p-3">
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <Lock className="size-3.5" /> {hiddenCount} hidden test{hiddenCount > 1 ? "s" : ""}
            {cases && (
              <span className="ml-auto flex gap-1">
                {cases.filter((c) => c.hidden).map((c, i) => (
                  <ResultIcon key={i} result={c} />
                ))}
              </span>
            )}
          </div>
        </div>
      )}
      {!cases && (
        <p className="pt-1 text-xs text-fg-faint">Press Submit to run your code against all tests.</p>
      )}
    </div>
  );
}

function ResultIcon({ result }: { result?: CaseResult }) {
  if (!result) return <Circle className="size-4 text-fg-faint" />;
  return result.passed ? (
    <CheckCircle2 className="size-4 text-success" />
  ) : (
    <XCircle className="size-4 text-[#fb7185]" />
  );
}
