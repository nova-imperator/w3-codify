"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, X, Award, Loader2, RotateCcw, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitAssessment } from "@/server/classroom-actions";

export type AssessmentData = {
  id: string;
  title: string;
  tier: string | null;
  passPct: number;
  questions: { q: string; options: string[]; answer: number; why?: string }[];
};

export function AssessmentPanel({
  courseId,
  assessment,
  prior,
  onResult,
}: {
  courseId: string;
  courseSlug?: string;
  assessment: AssessmentData;
  prior?: { score: number; total: number; passed: boolean };
  onResult?: (r: { passed: boolean; certificate: boolean }) => void;
}) {
  const isFinal = assessment.tier === null;
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<
    null | { score: number; total: number; pct: number; passed: boolean; certificate: boolean }
  >(null);

  const total = assessment.questions.length;
  const allAnswered = Object.keys(answers).length === total;

  async function submit() {
    if (!allAnswered) {
      toast.error("Answer all questions first.");
      return;
    }
    setSubmitting(true);
    const arr = assessment.questions.map((_, i) => answers[i] ?? -1);
    const res = await submitAssessment(courseId, assessment.id, arr);
    setSubmitting(false);
    if (res.ok && res.data) {
      setResult(res.data);
      onResult?.({ passed: res.data.passed, certificate: res.data.certificate });
      if (res.data.passed) toast.success(`Passed — ${res.data.pct}%`);
    } else if (!res.ok) {
      toast.error(res.error);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="container-page max-w-3xl py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className={cn("grid size-11 place-items-center rounded-[12px]", isFinal ? "bg-accent-grad text-white" : "bg-brand/12 text-brand")}>
          {isFinal ? <Award className="size-5" /> : <ListChecks className="size-5" />}
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            {isFinal ? "Final assessment" : `${assessment.tier} · Mini-assessment`}
          </p>
          <h1 className="text-2xl font-semibold">{assessment.title}</h1>
          <p className="text-sm text-fg-muted">
            {total} questions · pass at {assessment.passPct}%
            {prior && !result && (
              <span className="ml-1 text-fg-faint">· last attempt {Math.round((prior.score / prior.total) * 100)}%{prior.passed ? " ✓" : ""}</span>
            )}
          </p>
        </div>
      </div>

      {result ? (
        <ResultCard result={result} isFinal={isFinal} courseId={courseId} onRetry={retry} />
      ) : (
        <div className="flex flex-col gap-5">
          {assessment.questions.map((q, qi) => (
            <div key={qi} className="rounded-[14px] border border-border bg-bg-elevated p-5">
              <p className="mb-3 font-medium text-fg">
                <span className="text-fg-faint">{qi + 1}.</span> {q.q}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={cn(
                      "rounded-[10px] border px-4 py-2.5 text-left text-sm transition-colors",
                      answers[qi] === oi
                        ? "border-brand bg-brand/12 text-fg"
                        : "border-border bg-bg-subtle text-fg-muted hover:border-brand/40 hover:text-fg",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button size="lg" onClick={submit} disabled={submitting || !allAnswered} className="self-start">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Submit ({Object.keys(answers).length}/{total})
          </Button>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  result,
  isFinal,
  courseId,
  onRetry,
}: {
  result: { score: number; total: number; pct: number; passed: boolean; certificate: boolean };
  isFinal: boolean;
  courseId: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-bg-elevated p-8 text-center">
      <span
        className={cn(
          "mx-auto grid size-16 place-items-center rounded-full",
          result.passed ? "bg-success/15 text-success" : "bg-[#fb7185]/15 text-[#fb7185]",
        )}
      >
        {result.passed ? <Check className="size-8" strokeWidth={3} /> : <X className="size-8" strokeWidth={3} />}
      </span>
      <p className="mt-4 font-display text-4xl font-bold text-fg">{result.pct}%</p>
      <p className="mt-1 text-fg-muted">
        {result.score} / {result.total} correct — {result.passed ? "Passed" : "Keep going"}
      </p>

      {result.certificate ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-success">🎉 Course complete — your certificate is ready!</p>
          <Button asChild size="lg">
            <Link href={`/classroom/${courseId}/certificate`}>
              <Award className="size-4" /> View certificate
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex justify-center gap-3">
          {!result.passed && (
            <Button variant="secondary" onClick={onRetry}>
              <RotateCcw className="size-4" /> Try again
            </Button>
          )}
          {result.passed && !isFinal && (
            <p className="text-sm text-fg-muted">Nice — move on to the next tier.</p>
          )}
        </div>
      )}
    </div>
  );
}
