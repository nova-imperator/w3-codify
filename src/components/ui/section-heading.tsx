import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/** Eyebrow + title + optional subtitle, consistent across marketing sections. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            <span className="h-px w-6 bg-brand/60" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delayIndex={1}>
        <h2 className="max-w-3xl text-[length:var(--text-display-sm)] font-semibold">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delayIndex={2}>
          <p
            className={cn(
              "max-w-2xl text-base text-fg-muted md:text-lg",
              align === "center" && "mx-auto",
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
