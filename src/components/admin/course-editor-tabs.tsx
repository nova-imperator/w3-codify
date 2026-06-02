"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function CourseEditorTabs({
  details,
  curriculum,
}: {
  details: React.ReactNode;
  curriculum: React.ReactNode;
}) {
  const [tab, setTab] = React.useState<"details" | "curriculum">("details");
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1 rounded-[12px] border border-border bg-bg-subtle p-1 sm:w-fit">
        {(["details", "curriculum"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-[9px] px-5 py-2 text-sm font-medium capitalize transition-colors sm:flex-none",
              tab === t ? "bg-bg-elevated text-fg shadow-sm" : "text-fg-muted hover:text-fg",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className={tab === "details" ? "block" : "hidden"}>{details}</div>
      <div className={tab === "curriculum" ? "block" : "hidden"}>{curriculum}</div>
    </div>
  );
}
