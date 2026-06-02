import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";

/** On-brand placeholder for routes that land in a later session. */
export function ComingSoon({
  title,
  description,
  session,
}: {
  title: string;
  description: string;
  session?: string;
}) {
  return (
    <section className="relative flex min-h-[80svh] items-center justify-center overflow-hidden px-5 pt-28">
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)]" />
      <div className="relative flex max-w-xl flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-[16px] border border-border bg-bg-elevated text-brand">
          <Hammer className="size-6" />
        </span>
        <h1 className="mt-6 text-[length:var(--text-display-sm)] font-semibold">
          <GradientText>{title}</GradientText>
        </h1>
        <p className="mt-4 text-fg-muted">{description}</p>
        {session && (
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fg-faint">
            Shipping in {session}
          </p>
        )}
        <Button asChild variant="secondary" className="mt-8">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </Button>
      </div>
    </section>
  );
}
