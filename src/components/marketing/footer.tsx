"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Github, Linkedin, Twitter, Youtube, Instagram, ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Courses",
    links: [
      { label: "Machine Learning", href: "/courses/machine-learning-deep-learning" },
      { label: "Cloud Computing", href: "/courses/cloud-computing" },
      { label: "Cyber Security", href: "/courses/cyber-security" },
      { label: "All courses", href: "/courses" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Bootcamp", href: "/bootcamp" },
      { label: "Classroom", href: "/classroom" },
      { label: "Sign In", href: "/auth/signin" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
    ],
  },
];

const SOCIALS = [
  { label: "YouTube", icon: Youtube, href: "#" },
  { label: "X / Twitter", icon: Twitter, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "GitHub", icon: Github, href: "#" },
];

export function Footer() {
  function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email") as string;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }
    toast.success("Subscribed! Watch your inbox for the good stuff.");
    form.reset();
  }

  return (
    <footer className="relative mt-24 border-t border-border">
      {/* subtle top border glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent"
      />
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="max-w-sm text-sm text-fg-muted">
              An AI-powered online coding school. Learn live, build real
              projects, and get placed — with an AI mentor in your corner 24/7.
            </p>
            <form onSubmit={onSubscribe} className="flex max-w-sm gap-2">
              <Input
                name="email"
                type="email"
                placeholder="Your email"
                aria-label="Email for newsletter"
              />
              <Button type="submit" aria-label="Subscribe">
                <ArrowRight className="size-4" />
              </Button>
            </form>
            <div className="flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-[12px] border border-border bg-bg-elevated text-fg-muted transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <s.icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-fg">{col.title}</h3>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-fg-muted transition-colors hover:text-fg"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-fg-faint sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">{SITE.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
