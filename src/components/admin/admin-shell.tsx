"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  PhoneCall,
  ImageIcon,
  Settings,
  Menu,
  X,
  Search,
  LogOut,
  ExternalLink,
  Command as CommandIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { ProfileAvatar } from "@/components/shared/profile-avatar";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Instructors", href: "/admin/instructors", icon: Users },
  { label: "Students", href: "/admin/students", icon: GraduationCap },
  { label: "Leads", href: "/admin/leads", icon: PhoneCall },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function titleFor(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  const seg = pathname.split("/")[2] ?? "";
  if (pathname.startsWith("/admin/courses/")) return "Edit Course";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

export function AdminShell({
  user,
  children,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    gender?: "MALE" | "FEMALE" | "UNSPECIFIED" | null;
    avatarUrl?: string | null;
  };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-bg-elevated/40 lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
          >
            <ExternalLink className="size-4" /> View site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
          >
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-bg-elevated">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Logo />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="size-5 text-fg-muted" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
              {NAV.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </nav>
            <div className="border-t border-border p-3">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-fg-muted hover:bg-bg-subtle hover:text-fg"
              >
                <LogOut className="size-4" /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-bg/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5 text-fg-muted" />
            </button>
            <h1 className="font-display text-lg font-semibold">{titleFor(pathname)}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-[10px] border border-border bg-bg-subtle px-3 py-1.5 text-sm text-fg-muted transition-colors hover:text-fg sm:flex"
            >
              <Search className="size-4" />
              Search…
              <kbd className="ml-2 inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px]">
                <CommandIcon className="size-2.5" />K
              </kbd>
            </button>
            <ProfileAvatar
              user={user}
              size={36}
              className="size-9 border-brand/30"
              fallbackClassName="bg-brand/15 text-brand"
            />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

function NavItem({
  item,
  pathname,
}: {
  item: (typeof NAV)[number];
  pathname: string;
}) {
  const active =
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand/12 text-brand-glow"
          : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
      )}
    >
      <item.icon className="size-4.5" />
      {item.label}
    </Link>
  );
}

function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const items = React.useMemo(
    () => [
      ...NAV.map((n) => ({ label: n.label, href: n.href })),
      { label: "Create new course", href: "/admin/courses/new" },
      { label: "View live site", href: "/" },
    ],
    [],
  );
  const filtered = items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));

  React.useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[15vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[16px] border border-border-strong bg-bg-elevated shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-fg-faint" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to…"
            className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
          />
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-fg-faint">No results</li>
          )}
          {filtered.map((i) => (
            <li key={i.href}>
              <button
                onClick={() => {
                  onOpenChange(false);
                  router.push(i.href);
                }}
                className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-sm text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
              >
                {i.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
