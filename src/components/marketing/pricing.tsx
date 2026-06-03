import Link from "next/link";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING } from "@/lib/site";
import { formatINR, cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="container-page py-20 md:py-28">
      <SectionHeading
        eyebrow="Pricing"
        title="Start free. Upgrade when you're ready."
        subtitle="No hidden fees. No-cost EMI on paid cohorts. Cancel anytime before your batch starts."
      />

      <RevealGroup className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
        {PRICING.map((plan, i) => {
          const free = plan.price === 0;
          return (
            <Reveal key={plan.name} delayIndex={i}>
              <div
                className={cn(
                  "relative flex h-full flex-col gap-6 rounded-[20px] border p-7 transition-colors",
                  plan.highlight
                    ? "border-brand/50 bg-bg-elevated shadow-[0_30px_80px_-40px_rgba(109,94,246,0.5)]"
                    : "border-border bg-bg-elevated",
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="brand" className="shadow-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-fg-muted">{plan.description}</p>
                </div>

                <div className="flex items-end gap-2">
                  {free ? (
                    <span className="font-display text-4xl font-bold text-fg">
                      Free
                    </span>
                  ) : (
                    <>
                      <span className="font-display text-4xl font-bold text-fg">
                        {formatINR(plan.price)}
                      </span>
                      {"mrp" in plan && plan.mrp && (
                        <span className="mb-1.5 text-sm text-fg-faint line-through">
                          {formatINR(plan.mrp)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className="text-fg-muted">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  variant={plan.highlight ? "primary" : "secondary"}
                  className="w-full"
                >
                  <Link href={free ? "/auth/signup" : "/courses"}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </Reveal>
          );
        })}
      </RevealGroup>
      <p className="mt-6 text-center text-xs text-fg-faint">
        * Job guarantee terms apply. Speak to an advisor for details.
      </p>
    </section>
  );
}
