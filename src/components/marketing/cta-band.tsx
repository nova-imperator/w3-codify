import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

/**
 * Home closing banner (§6.1 #13) — replaces the old orange phone-capture band.
 * A slim, on-brand indigo→cyan panel (banner image with a gradient fallback) and
 * a single Sign In CTA. No phone capture.
 */
export function CtaBand() {
  return (
    <section className="container-page py-12 md:py-20">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[28px] border border-brand/30">
          {/* On-brand gradient fallback (always painted) */}
          <div className="bg-accent-grad absolute inset-0 -z-10" />
          {/* Banner art (placeholder until final art lands) */}
          <Image
            src="/images/home/cta-banner.png"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 1216px"
            className="-z-10 object-cover opacity-90"
          />
          {/* Legibility wash */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_140%_at_50%_-20%,transparent_0%,rgba(8,9,18,0.55)_100%)]" />

          <div className="flex flex-col items-center gap-6 px-6 py-12 text-center md:flex-row md:justify-between md:px-14 md:py-14 md:text-left">
            <div className="max-w-xl">
              <h2 className="text-balance text-[length:var(--text-display-sm)] font-bold leading-tight text-white">
                Start learning for free today.
              </h2>
              <p className="mt-3 text-pretty text-white/90">
                Join 1M+ learners. Every course is free during launch — sign in and
                start building in minutes.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="shrink-0 bg-white text-[#1b1140] shadow-lg hover:bg-white/90"
            >
              <Link href="/auth/signin">
                Sign In
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
