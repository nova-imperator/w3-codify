"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  return d.length <= 5 ? d : `${d.slice(0, 5)} ${d.slice(5)}`;
}

export function CtaBand() {
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length !== 10) {
      toast.error("Enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // signup API lands Session 3
    setLoading(false);
    toast.success("Let's go! We'll text you a link to start for free.");
    setPhone("");
  }

  return (
    <section className="container-page py-12 md:py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] border border-brand/30 p-8 md:p-16">
          {/* gradient panel backdrop */}
          <div className="bg-accent-grad absolute inset-0 opacity-90" />
          <div className="bg-grid absolute inset-0 opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-20%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_100%)]" />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="text-balance text-[length:var(--text-display-sm)] font-bold text-white">
              Start learning for free today.
            </h2>
            <p className="mt-4 max-w-md text-white/90">
              Join 1M+ learners. Enter your number and we&apos;ll send you a
              link to begin — no card required.
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-2 rounded-[14px] border border-white/30 bg-black/20 px-3 backdrop-blur focus-within:border-white">
                <span className="select-none text-sm font-medium text-white/90">
                  🇮🇳 +91
                </span>
                <input
                  inputMode="numeric"
                  autoComplete="tel"
                  aria-label="Phone number"
                  placeholder="98765 43210"
                  value={formatPhone(phone)}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="bg-bg text-fg shadow-lg hover:bg-bg-elevated"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Start free
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
