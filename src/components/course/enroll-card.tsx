"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Play,
  Heart,
  Share2,
  Clock,
  FileDown,
  Smartphone,
  BadgeCheck,
  Infinity as InfinityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/shared/smart-image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatINR, formatDuration, discountPercent, cn } from "@/lib/utils";

export function EnrollCard({
  slug,
  title,
  priceInr,
  mrpInr,
  thumbnail,
  accent,
  totalSec,
  lessonCount,
  resourceCount,
}: {
  slug: string;
  title: string;
  priceInr: number;
  mrpInr: number;
  thumbnail: string;
  accent: string;
  totalSec: number;
  lessonCount: number;
  resourceCount: number;
}) {
  const [wished, setWished] = React.useState(false);
  const free = priceInr === 0;
  const discount = discountPercent(priceInr, mrpInr);

  async function share() {
    const url = `${window.location.origin}/courses/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user dismissed the share sheet — no-op */
    }
  }

  const includes = [
    { icon: Clock, label: `${formatDuration(totalSec)} on-demand video` },
    { icon: FileDown, label: `${resourceCount} downloadable resources` },
    { icon: Smartphone, label: "Access on mobile and TV" },
    { icon: InfinityIcon, label: "Full lifetime access" },
    { icon: BadgeCheck, label: "Certificate of completion" },
  ];

  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-bg-elevated shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
      {/* Preview */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="group relative block aspect-video w-full overflow-hidden">
            <SmartImage
              src={thumbnail}
              alt={`Preview ${title}`}
              sizes="380px"
              fallbackClassName={cn("bg-gradient-to-br", accent)}
              className="transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/30 transition-colors group-hover:bg-black/20">
              <span className="grid size-14 place-items-center rounded-full bg-white/90 text-bg shadow-lg transition-transform group-hover:scale-110">
                <Play className="size-6 fill-current" />
              </span>
            </span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Preview this course
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl border-border-strong p-0">
          <DialogTitle className="sr-only">{title} preview</DialogTitle>
          <div className="grid aspect-video w-full place-items-center rounded-[20px] bg-bg">
            <p className="px-6 text-center text-sm text-fg-muted">
              Preview player (Mux) arrives with the classroom in a later
              milestone.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-end gap-3">
          {free ? (
            <span className="font-display text-3xl font-bold text-success">
              Free
            </span>
          ) : (
            <>
              <span className="font-display text-3xl font-bold text-fg">
                {formatINR(priceInr)}
              </span>
              {mrpInr > priceInr && (
                <span className="mb-1 text-base text-fg-faint line-through">
                  {formatINR(mrpInr)}
                </span>
              )}
              {discount > 0 && <Badge variant="discount">{discount}% OFF</Badge>}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Auth-gating lands in Session 3; for now route to signup. */}
          <Button asChild size="lg" className="w-full">
            <Link href="/auth/signup">
              {free ? "Start for free" : "Enroll now"}
            </Link>
          </Button>
          <div className="flex gap-2.5">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              aria-pressed={wished}
              onClick={() => {
                setWished((w) => !w);
                toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
              }}
            >
              <Heart className={cn("size-4", wished && "fill-brand text-brand")} />
              {wished ? "Wishlisted" : "Wishlist"}
            </Button>
            <Button variant="secondary" size="lg" className="flex-1" onClick={share}>
              <Share2 className="size-4" />
              Share
            </Button>
          </div>
          <p className="text-center text-xs text-fg-faint">
            30-day money-back guarantee
          </p>
        </div>

        <div className="border-t border-border pt-5">
          <p className="mb-3 text-sm font-semibold text-fg">
            This course includes
          </p>
          <ul className="flex flex-col gap-2.5">
            {includes.map((it) => (
              <li
                key={it.label}
                className="flex items-center gap-2.5 text-sm text-fg-muted"
              >
                <it.icon className="size-4 shrink-0 text-fg-faint" />
                {it.label}
              </li>
            ))}
            <li className="flex items-center gap-2.5 text-sm text-fg-muted">
              <BadgeCheck className="size-4 shrink-0 text-fg-faint" />
              {lessonCount} lessons across the full track
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
