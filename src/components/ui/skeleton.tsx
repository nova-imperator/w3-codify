import { cn } from "@/lib/utils";

/** Shimmer skeleton placeholder for async surfaces (§2, §14). */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px] bg-bg-subtle",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:content-[''] motion-reduce:before:hidden",
        className,
      )}
      {...props}
    />
  );
}
