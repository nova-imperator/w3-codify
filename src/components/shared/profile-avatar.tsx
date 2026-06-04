"use client";

import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { resolveAvatarUrl, initialsOf, type AvatarUser } from "@/lib/avatar";

/**
 * The one avatar component used everywhere a user avatar renders. Resolves the
 * image via `resolveAvatarUrl` (custom upload → gender default → initials) and
 * serves it through `next/image`. Falls back to initials when nothing resolves.
 *
 * `size` is the intrinsic pixel size handed to next/image; control the rendered
 * box with `className` (e.g. `size-9`, `size-24`).
 */
export function ProfileAvatar({
  user,
  size = 36,
  className,
  fallbackClassName,
}: {
  user: AvatarUser;
  size?: number;
  className?: string;
  fallbackClassName?: string;
}) {
  const url = resolveAvatarUrl(user);
  const label = user.name || "User";

  return (
    <Avatar className={className}>
      {url ? (
        <Image
          src={url}
          alt={label}
          width={size}
          height={size}
          className="aspect-square h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <AvatarFallback className={fallbackClassName}>{initialsOf(user.name)}</AvatarFallback>
      )}
    </Avatar>
  );
}
