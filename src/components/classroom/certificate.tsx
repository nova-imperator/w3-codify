"use client";

import * as React from "react";
import { Award, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Certificate({
  studentName,
  courseTitle,
  instructor,
  scorePct,
  dateISO,
  certId,
}: {
  studentName: string;
  courseTitle: string;
  instructor: string;
  scorePct: number;
  dateISO: string;
  certId: string;
}) {
  const date = new Date(dateISO).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()} variant="secondary">
          <Printer className="size-4" /> Print / Save as PDF
        </Button>
      </div>

      <div
        id="certificate"
        className="relative overflow-hidden rounded-[24px] border border-border bg-bg-elevated p-8 shadow-xl sm:p-14 print:border-0 print:shadow-none"
      >
        {/* Decorative gradient frame */}
        <div className="bg-accent-grad pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
        <div className="pointer-events-none absolute inset-3 rounded-[18px] border border-brand/20" aria-hidden />

        <div className="relative flex flex-col items-center text-center">
          <span className="bg-accent-grad grid size-16 place-items-center rounded-2xl text-white shadow-lg">
            <Award className="size-8" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
            Certificate of Completion
          </p>
          <p className="mt-6 text-sm text-fg-muted">This certifies that</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">{studentName}</h1>
          <p className="mt-5 max-w-lg text-sm text-fg-muted">
            has successfully completed all lessons, checkpoints and the final assessment for
          </p>
          <h2 className="mt-2 text-xl font-semibold text-fg sm:text-2xl">{courseTitle}</h2>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-success/12 px-4 py-1.5 text-sm font-medium text-success">
            <ShieldCheck className="size-4" /> Final score {scorePct}%
          </div>

          <div className="mt-10 grid w-full max-w-lg grid-cols-2 gap-6 border-t border-border pt-6 text-left">
            <div>
              <p className="text-xs uppercase tracking-wide text-fg-faint">Instructor</p>
              <p className="mt-1 font-medium text-fg">{instructor}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-fg-faint">Issued</p>
              <p className="mt-1 font-medium text-fg">{date}</p>
            </div>
          </div>

          <p className="mt-6 font-mono text-[11px] text-fg-faint">
            Credential ID · {certId} · W3Codify
          </p>
        </div>
      </div>
    </div>
  );
}
