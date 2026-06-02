import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { CourseCatalog } from "@/components/course/course-catalog";
import { getPublishedCourseCards } from "@/server/courses";
import { SITE } from "@/lib/site";

export const revalidate = 300; // ISR — reflects admin changes without a rebuild

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse W3Codify's expert-led, AI-supported courses — Machine Learning, Cloud Computing, Cyber Security and more. Live cohorts and self-paced tracks.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Courses · W3Codify",
    description:
      "Expert-led, AI-supported courses. Live cohorts and self-paced tracks — from Basics to GOD tier.",
    url: `${SITE.url}/courses`,
  },
};

export default async function CoursesPage() {
  const courses = await getPublishedCourseCards();

  return (
    <div className="container-page pb-12 pt-32 md:pt-36">
      <div className="mb-12">
        <SectionHeading
          align="left"
          eyebrow="Courses"
          title="Level up your coding skills with expert-led courses"
          subtitle="Live cohorts and self-paced tracks, each with a 24/7 AI tutor. Filter by topic, level, or format and find your path."
        />
      </div>
      <CourseCatalog courses={courses} />
    </div>
  );
}
