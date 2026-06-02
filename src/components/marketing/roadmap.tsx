"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { ROADMAP } from "@/lib/site";

export function Roadmap() {
  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        eyebrow="Your learning path"
        title="From foundations to placement"
        subtitle="A clear, structured ladder. Every step builds on the last — and you always know what's next."
      />

      <div className="relative mx-auto mt-16 max-w-3xl">
        {/* connecting rail */}
        <div
          aria-hidden
          className="absolute bottom-0 left-[27px] top-2 w-px bg-border md:left-1/2 md:-translate-x-1/2"
        >
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ originY: 0 }}
            className="h-full w-full bg-gradient-to-b from-brand via-brand/60 to-transparent"
          />
        </div>

        <ol className="flex flex-col gap-10">
          {ROADMAP.map((step, i) => {
            const left = i % 2 === 0;
            return (
              <Reveal as="li" key={step.phase} delayIndex={i}>
                <div
                  className={`relative flex items-start gap-5 md:w-1/2 ${
                    left ? "md:pr-12" : "md:ml-auto md:flex-row-reverse md:pl-12 md:text-right"
                  }`}
                >
                  {/* node */}
                  <span
                    className={`relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl border border-brand/30 bg-bg-elevated font-display text-lg font-bold text-brand md:absolute md:top-0 ${
                      left ? "md:-right-7" : "md:-left-7"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-2 ${!left && "md:justify-end"}`}>
                      <h3 className="text-lg font-semibold">{step.phase}</h3>
                      <Badge variant={step.tier === "GOD" ? "brand" : "default"}>
                        {step.tier}
                      </Badge>
                    </div>
                    <p className="text-sm text-fg-muted">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>

        <Reveal delayIndex={ROADMAP.length}>
          <div className="relative z-10 mt-10 flex items-center gap-3 md:justify-center">
            <span className="bg-accent-grad grid size-14 place-items-center rounded-2xl text-white shadow-[0_8px_30px_-8px_rgba(255,90,31,0.6)]">
              <Check className="size-6" strokeWidth={3} />
            </span>
            <p className="font-display text-lg font-semibold">
              Hired. <span className="text-fg-muted">Welcome to the industry.</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
