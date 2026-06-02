"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, PhoneCall } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/site";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RequestCallbackDialog } from "./request-callback";
import { UserMenu } from "./user-menu";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 md:pt-4"
    >
      <div
        className={cn(
          "flex w-full max-w-6xl items-center justify-between gap-4 rounded-[18px] border px-3 py-2.5 transition-all duration-300 md:px-4",
          scrolled
            ? "glass border-border-strong shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)]"
            : "border-transparent bg-transparent",
        )}
      >
        <Logo />

        {/* Center pill nav (desktop) */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-bg-elevated/60 p-1 backdrop-blur-md lg:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active ? "text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-bg-subtle"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
          <RequestCallbackDialog>
            <button className="rounded-full px-4 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg">
              Request Callback
            </button>
          </RequestCallbackDialog>
        </nav>

        {/* Right actions (desktop) */}
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Magnetic>
                <Button asChild size="sm">
                  <Link href="/auth/signup">Start Journey</Link>
                </Button>
              </Magnetic>
            </>
          )}
        </div>

        {/* Mobile trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <Logo />
              <nav className="mt-2 flex flex-col gap-1" aria-label="Mobile">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-[12px] px-4 py-3 text-lg font-medium transition-colors",
                        pathname === link.href
                          ? "bg-bg-subtle text-fg"
                          : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3">
                {user && (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/classroom"
                        className="rounded-[12px] px-4 py-3 text-lg font-medium text-fg-muted hover:bg-bg-subtle hover:text-fg"
                      >
                        Classroom
                      </Link>
                    </SheetClose>
                    {user.role === "ADMIN" && (
                      <SheetClose asChild>
                        <Link
                          href="/admin"
                          className="rounded-[12px] px-4 py-3 text-lg font-medium text-brand hover:bg-bg-subtle"
                        >
                          Admin Panel
                        </Link>
                      </SheetClose>
                    )}
                  </>
                )}
                <RequestCallbackDialog>
                  <Button variant="secondary" size="lg" className="w-full">
                    <PhoneCall className="size-4" /> Request Callback
                  </Button>
                </RequestCallbackDialog>
                {user ? (
                  <SheetClose asChild>
                    <Button asChild size="lg" className="w-full">
                      <Link href="/profile">My Profile</Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="ghost" size="lg" className="w-full">
                        <Link href="/auth/signin">Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild size="lg" className="w-full">
                        <Link href="/auth/signup">Start Journey</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
