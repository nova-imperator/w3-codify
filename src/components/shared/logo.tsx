import Link from "next/link";
import { cn } from "@/lib/utils";

/** W3Codify wordmark: a molten-orange "code bracket" mark + name. */
export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="W3Codify home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="bg-accent-grad relative grid size-9 place-items-center rounded-[10px] shadow-[0_4px_18px_-4px_rgba(255,90,31,0.6)]">
        <svg
          viewBox="0 0 24 24"
          className="size-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m8 8-4 4 4 4" />
          <path d="m16 8 4 4-4 4" />
          <path d="m13 6-2 12" />
        </svg>
      </span>
      {showText && (
        <span className="font-display text-lg font-semibold tracking-tight text-fg">
          W3<span className="text-gradient">Codify</span>
        </span>
      )}
    </Link>
  );
}
