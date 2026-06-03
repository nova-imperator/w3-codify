import { Hero } from "@/components/marketing/hero";
import { TechMarquee } from "@/components/marketing/tech-marquee";
import { StatsBand } from "@/components/marketing/stats-band";
import { AiTutorTeaser } from "@/components/marketing/ai-tutor-teaser";
import { FeaturedCourses } from "@/components/marketing/featured-courses";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Roadmap } from "@/components/marketing/roadmap";
import { Outcomes } from "@/components/marketing/outcomes";
import { Instructors } from "@/components/marketing/instructors";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { OrganizationJsonLd } from "@/components/shared/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const revalidate = 300; // ISR — featured courses come from the DB

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      <TechMarquee />
      <StatsBand />
      <AiTutorTeaser />
      <FeaturedCourses />
      <FeatureGrid />
      <Roadmap />
      <Outcomes />
      <Instructors />
      <Testimonials />
      <Pricing />
      <Faq />
      <CtaBand />
    </>
  );
}
