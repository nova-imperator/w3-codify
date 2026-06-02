import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,#000_15%,transparent_70%)]" />
      <div className="relative flex flex-col items-center">
        <Logo />
        <h1 className="mt-10 font-display text-[clamp(4rem,18vw,9rem)] font-bold leading-none">
          <GradientText>404</GradientText>
        </h1>
        <p className="mt-4 max-w-sm text-fg-muted">
          This page wandered off. Let&apos;s get you back to learning.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </Button>
      </div>
    </div>
  );
}
