import { Marquee } from "@/components/ui/marquee";
import { TECH_LOGOS } from "@/lib/site";

export function TechMarquee() {
  return (
    <section
      aria-label="Technologies you'll master"
      className="border-y border-border bg-bg-elevated/40 py-8"
    >
      <p className="container-page mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-fg-faint">
        Master the full modern stack
      </p>
      <Marquee className="gap-6">
        {TECH_LOGOS.map((t) => (
          <span
            key={t}
            className="select-none whitespace-nowrap rounded-full border border-border bg-bg-elevated px-5 py-2 font-display text-base font-medium text-fg-muted transition-colors hover:text-fg"
          >
            {t}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
