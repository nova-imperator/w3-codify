import { TrendingUp, Building2, Award } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { COMPANIES } from "@/lib/site";

const SNAPSHOTS = [
  {
    icon: TrendingUp,
    stat: "₹21 LPA",
    label: "Average package for placed students",
  },
  {
    icon: Building2,
    stat: "500+",
    label: "Hiring partners across India & remote",
  },
  { icon: Award, stat: "92%", label: "Placement rate within 6 months" },
];

export function Outcomes() {
  return (
    <section className="border-y border-border bg-bg-elevated/30 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Outcomes"
          title="Our students get placed at companies that matter"
          subtitle="Real results, not vanity metrics. Here's where our learners end up."
        />

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-3">
          {SNAPSHOTS.map((s, i) => (
            <Reveal key={s.label} delayIndex={i}>
              <div className="flex h-full flex-col gap-3 rounded-[18px] border border-border bg-bg-elevated p-6">
                <span className="grid size-11 place-items-center rounded-[12px] bg-brand/12 text-brand">
                  <s.icon className="size-5" />
                </span>
                <span className="font-display text-3xl font-bold text-fg">
                  {s.stat}
                </span>
                <span className="text-sm text-fg-muted">{s.label}</span>
              </div>
            </Reveal>
          ))}
        </RevealGroup>

        <Reveal>
          <p className="mt-16 text-center text-xs font-medium uppercase tracking-[0.2em] text-fg-faint">
            Where our alumni work
          </p>
        </Reveal>
        <RevealGroup className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {COMPANIES.map((company, i) => (
            <Reveal key={company} delayIndex={i % 5}>
              <div className="group flex h-20 items-center justify-center bg-bg-elevated px-4">
                <span className="font-display text-lg font-semibold text-fg-faint grayscale transition-all duration-300 group-hover:text-fg group-hover:grayscale-0">
                  {company}
                </span>
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
