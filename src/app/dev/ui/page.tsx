import type { Metadata } from "next";
import { Star, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GradientText } from "@/components/ui/gradient-text";
import { Magnetic } from "@/components/ui/magnetic";
import { Marquee } from "@/components/ui/marquee";
import { StatCounter } from "@/components/ui/stat-counter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CourseCard } from "@/components/course/course-card";
import { FEATURED_COURSES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 border-t border-border py-10">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DevUiPage() {
  return (
    <div className="container-page py-16">
      <header className="flex flex-col gap-2 pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-fg-faint">
          /dev/ui · not indexed
        </span>
        <h1 className="font-display text-4xl font-bold">
          <GradientText>W3Codify</GradientText> Design System
        </h1>
        <p className="max-w-xl text-fg-muted">
          The themed component library powering the platform — dark, cinematic,
          molten-orange. Built on shadcn/Radix primitives.
        </p>
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Magnetic>
            <Button>Magnetic ✨</Button>
          </Magnetic>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="settings">
            <Settings />
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="brand">Brand</Badge>
          <Badge variant="discount">50% OFF</Badge>
          <Badge variant="outline">Self-paced</Badge>
          <LiveBadge />
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-3">
          <h1 className="text-[length:var(--text-display)] font-bold">
            Display <GradientText>Headline</GradientText>
          </h1>
          <h3 className="font-display text-2xl font-semibold">Section heading</h3>
          <p className="max-w-prose text-fg-muted">
            Body copy uses Inter at a comfortable 1.6 line-height with muted
            foreground for paragraphs. Display type is Clash Display.
          </p>
        </div>
      </Section>

      <Section title="Forms">
        <div className="grid max-w-md gap-4">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled" disabled />
          <label className="flex items-center gap-2.5 text-sm text-fg-muted">
            <Checkbox defaultChecked />I agree to receive communications
          </label>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>A simple elevated surface.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-fg-muted">
                Cards use subtle borders and soft glows instead of heavy shadows.
              </p>
            </CardContent>
          </Card>
          <div className="flex items-center gap-1.5 rounded-[16px] border border-border bg-bg-elevated p-6">
            <Star className="size-5 fill-brand text-brand" />
            <StatCounter
              value={1_000_000}
              suffix="+"
              className="font-display text-3xl font-bold text-gradient"
            />
            <span className="ml-2 text-sm text-fg-muted">animated counter</span>
          </div>
        </div>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog title</DialogTitle>
                <DialogDescription>
                  Accessible modal built on Radix Dialog with a custom pop
                  animation.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="gap-2">
                <Avatar className="size-6">
                  <AvatarFallback>W3</AvatarFallback>
                </Avatar>
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <User /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>

      <Section title="Accordion">
        <div className="max-w-2xl">
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            <AccordionItem value="a">
              <AccordionTrigger>What is W3Codify?</AccordionTrigger>
              <AccordionContent>
                An AI-powered online coding school with live cohorts and a 24/7
                tutor.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Is there a free option?</AccordionTrigger>
              <AccordionContent>
                Yes — the Free Intro tier needs no card.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Section>

      <Section title="Skeletons">
        <div className="flex max-w-md flex-col gap-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Section>

      <Section title="Marquee">
        <Marquee>
          {["React", "Next.js", "TypeScript", "Python", "AWS", "Docker"].map(
            (t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-bg-elevated px-5 py-2 font-display text-fg-muted"
              >
                {t}
              </span>
            ),
          )}
        </Marquee>
      </Section>

      <Section title="CourseCard">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_COURSES.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </Section>
    </div>
  );
}
