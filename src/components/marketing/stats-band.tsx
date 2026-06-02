import { StatCounter } from "@/components/ui/stat-counter";
import { Reveal } from "@/components/ui/reveal";
import { STATS } from "@/lib/site";

export function StatsBand() {
  return (
    <section className="relative overflow-hidden py-20 md:py-24">
      {/* faint kinetic backdrop text (§6.1.3) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[22vw] font-bold leading-none text-fg/[0.025] select-none"
      >
        make it happen
      </span>

      <div className="container-page relative">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delayIndex={i}>
              <div className="flex flex-col items-center text-center">
                <dd className="font-display text-[length:var(--text-display-sm)] font-bold text-gradient">
                  <StatCounter
                    value={stat.value}
                    prefix={"prefix" in stat ? stat.prefix : ""}
                    suffix={stat.suffix}
                  />
                </dd>
                <dt className="mt-2 text-sm text-fg-muted">{stat.label}</dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
