import { cn } from "@/lib/utils";

/** Renders text with the brand molten-orange gradient (§5.1). */
export function GradientText({
  children,
  className,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return <Tag className={cn("text-gradient", className)}>{children}</Tag>;
}
