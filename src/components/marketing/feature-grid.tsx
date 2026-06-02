import {
  Radio,
  Sparkles,
  Rocket,
  Briefcase,
  Users,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { FEATURES } from "@/lib/site";

const ICONS: Record<string, LucideIcon> = {
  radio: Radio,
  sparkles: Sparkles,
  rocket: Rocket,
  briefcase: Briefcase,
  users: Users,
  "graduation-cap": GraduationCap,
};

export function FeatureGrid() {
  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        eyebrow="Why W3Codify"
        title="A real school, not a playlist"
        subtitle="Everything you need to go from knowing the basics to getting hired — under one roof."
      />

      <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => {
          const Icon = ICONS[feature.icon] ?? Sparkles;
          return (
            <Reveal key={feature.title} delayIndex={i % 3}>
              <article className="group relative h-full overflow-hidden rounded-[18px] border border-border bg-bg-elevated p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong">
                {/* hover glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="relative grid size-12 place-items-center rounded-[14px] border border-border bg-bg-subtle text-brand transition-colors group-hover:border-brand/40 group-hover:bg-brand/10">
                  <Icon className="size-5.5" />
                </span>
                <h3 className="relative mt-5 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-fg-muted">
                  {feature.desc}
                </p>
              </article>
            </Reveal>
          );
        })}
      </RevealGroup>
    </section>
  );
}
