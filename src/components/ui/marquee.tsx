import { cn } from "@/lib/utils";

/**
 * Infinite marquee row. Duplicates children for a seamless loop; pauses on
 * hover and is disabled under reduced-motion (§5.4). Pure CSS animation.
 */
export function Marquee({
  children,
  reverse = false,
  className,
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={cn("group/marquee mask-fade-x flex overflow-hidden", className)}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-4 pr-4",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
          "motion-reduce:animate-none",
        )}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "flex shrink-0 items-center gap-4 pr-4",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
          "motion-reduce:animate-none",
        )}
      >
        {children}
      </div>
    </div>
  );
}
