"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { GraduationCap, User, LogOut, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  role?: "STUDENT" | "INSTRUCTOR" | "ADMIN";
};

export function UserMenu({ user }: { user: SessionUser }) {
  const initials =
    (user.name ?? "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="rounded-full outline-none ring-offset-bg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="size-9 border-brand/30">
            <AvatarFallback className="bg-brand/15 text-brand">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-medium text-fg">{user.name || "Learner"}</span>
          {user.email && <span className="block truncate text-xs text-fg-faint">{user.email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin"><ShieldCheck /> Admin Panel</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/classroom"><GraduationCap /> Classroom</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile"><User /> Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
