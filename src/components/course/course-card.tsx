import Link from "next/link";
import { Star, ArrowUpRight, Users, Sparkles } from "lucide-react";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { SmartImage } from "@/components/shared/smart-image";
import { formatINR, formatCompact, cn } from "@/lib/utils";
import { pricingFor } from "@/lib/pricing";
import type { CourseCardData } from "@/server/courses";

export function CourseCard({
  course,
  className,
}: {
  course: CourseCardData;
  className?: string;
}) {
  const { free, anchorInr, launchOffer } = pricingFor(course.priceInr, course.mrpInr);
  const discount =
    !free && course.mrpInr > 0
      ? Math.round(((course.mrpInr - course.priceInr) / course.mrpInr) * 100)
      : 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[18px] border border-border bg-bg-elevated transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <SmartImage
          src={course.image}
          alt={`${course.title} — taught by ${course.instructor}`}
          sizes="(max-width: 768px) 90vw, 380px"
          className="transition-transform duration-500 group-hover:scale-105"
          fallbackClassName={cn("bg-gradient-to-br", course.accent)}
        >
          <span className="absolute bottom-3 left-4 font-display text-2xl font-semibold text-white/90 drop-shadow">
            {course.title.split(" ")[0]}
          </span>
        </SmartImage>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {course.isLive ? <LiveBadge /> : <Badge variant="outline">Self-paced</Badge>}
          {launchOffer ? (
            <Badge variant="discount">100% OFF</Badge>
          ) : (
            discount > 0 && <Badge variant="discount">{discount}% OFF</Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {course.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="default">
              {t}
            </Badge>
          ))}
        </div>

        <h3 className="text-base font-semibold leading-snug text-fg transition-colors group-hover:text-brand-glow">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm text-fg-muted">{course.blurb}</p>

        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-1 font-medium text-fg">
            <Star className="size-3.5 fill-brand text-brand" />
            {course.rating}
          </span>
          <span>({formatCompact(course.ratingCount)})</span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {formatCompact(course.learners)}
          </span>
        </div>

        {launchOffer && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand/12 px-2.5 py-1 text-[11px] font-semibold text-brand-glow">
            <Sparkles className="size-3" /> Launch Offer · 100% OFF · Limited Time
          </span>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-baseline gap-2">
            {free ? (
              <>
                <span className="text-sm text-fg-faint line-through">
                  {formatINR(anchorInr)}
                </span>
                <span className="text-lg font-bold text-success">FREE</span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-fg">
                  {formatINR(course.priceInr)}
                </span>
                {course.mrpInr > course.priceInr && (
                  <span className="text-sm text-fg-faint line-through">
                    {formatINR(course.mrpInr)}
                  </span>
                )}
              </>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
            View
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
