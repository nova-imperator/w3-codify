"use client";

import { KeyRound } from "lucide-react";

/**
 * Shown only when SMTP isn't configured: surfaces the generated OTP so the
 * flow is testable on dev/staging. Disappears automatically once SMTP is set.
 */
export function DevCodeNotice({
  code,
  onUse,
}: {
  code: string;
  onUse: (code: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[12px] border border-brand/30 bg-brand/10 px-3.5 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <KeyRound className="size-4 shrink-0 text-brand" />
        <span className="text-fg-muted">
          Email not configured — your code is{" "}
          <span className="font-mono font-semibold text-fg">{code}</span>
        </span>
      </div>
      <button
        onClick={() => onUse(code)}
        className="shrink-0 text-xs font-semibold text-brand hover:underline"
      >
        Use code
      </button>
    </div>
  );
}
