"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * Renders a next/image when the asset exists, and a tasteful brand gradient
 * placeholder when it doesn't (the Whisk image pack is dropped in later —
 * see WHISK_IMAGE_PROMPTS.md). Keeps the page beautiful with zero 404 noise.
 */
export function SmartImage({
  className,
  fallbackClassName,
  alt,
  fill = true,
  children,
  ...props
}: Omit<ImageProps, "alt"> & {
  alt: string;
  fallbackClassName?: string;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = React.useState(false);

  if (failed || !props.src) {
    return (
      <div
        aria-hidden
        className={cn(
          "bg-accent-grad relative h-full w-full overflow-hidden",
          fallbackClassName,
          className,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_30%_0%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_100%)]" />
        <div className="bg-grid absolute inset-0 opacity-30 mix-blend-overlay" />
        {children}
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      fill={fill}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
