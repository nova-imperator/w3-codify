"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course/course-card";
import { FEATURED_COURSES } from "@/lib/site";

export function FeaturedCourses() {
  const trackRef = React.useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <section id="courses" className="container-page py-20 md:py-28">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          align="left"
          eyebrow="Courses"
          title="Level up with expert-led, AI-supported tracks"
          subtitle="Every course runs the same proven ladder — a fast Basics refresher, deep Advanced work, then GOD-tier mastery."
        />
        <Reveal>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous courses"
              onClick={() => scroll(-1)}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next courses"
              onClick={() => scroll(1)}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </Reveal>
      </div>

      <RevealGroup>
        <div
          ref={trackRef}
          className="mt-10 grid auto-cols-[88%] grid-flow-col gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[48%] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible"
        >
          {FEATURED_COURSES.map((course, i) => (
            <Reveal key={course.slug} delayIndex={i} className="snap-start">
              <CourseCard course={course} className="h-full" />
            </Reveal>
          ))}
        </div>
      </RevealGroup>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/courses">
            View all courses
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
