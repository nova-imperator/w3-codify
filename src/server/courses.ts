import { prisma } from "@/lib/prisma";
import type { Level } from "@prisma/client";

/** Normalized shape consumed by CourseCard (decouples UI from the DB row). */
export type CourseCardData = {
  slug: string;
  title: string;
  blurb: string;
  tags: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  isLive: boolean;
  priceInr: number;
  mrpInr: number;
  rating: number;
  ratingCount: number;
  learners: number;
  instructor: string;
  image: string;
  accent: string;
};

const ACCENTS: Record<string, string> = {
  "machine-learning-deep-learning": "from-[#ff7a3c] to-[#e0360a]",
  "cloud-computing": "from-[#ffa05a] to-[#ff5a1f]",
  "cyber-security": "from-[#ff6a4d] to-[#c83c0e]",
};
const ACCENT_POOL = [
  "from-[#ff7a3c] to-[#e0360a]",
  "from-[#ffa05a] to-[#ff5a1f]",
  "from-[#ff6a4d] to-[#c83c0e]",
  "from-[#ff9152] to-[#d8410f]",
];

/** Deterministic accent for any course (seeded ones get their signature one). */
export function accentForSlug(slug: string): string {
  if (ACCENTS[slug]) return ACCENTS[slug];
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return ACCENT_POOL[Math.abs(h) % ACCENT_POOL.length];
}

export function levelLabel(level: Level): CourseCardData["level"] {
  return level === "BEGINNER"
    ? "Beginner"
    : level === "INTERMEDIATE"
      ? "Intermediate"
      : "Advanced";
}

type CourseWithInstructorNames = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  thumbnail: string | null;
  tags: string[];
  level: Level;
  isLive: boolean;
  priceInr: number;
  mrpInr: number | null;
  rating: number;
  ratingCount: number;
  learners: number;
  instructors: { name: string }[];
};

export function toCardData(c: CourseWithInstructorNames): CourseCardData {
  return {
    slug: c.slug,
    title: c.title,
    blurb: c.subtitle ?? c.description.slice(0, 120),
    tags: c.tags,
    level: levelLabel(c.level),
    isLive: c.isLive,
    priceInr: c.priceInr,
    mrpInr: c.mrpInr ?? 0,
    rating: c.rating,
    ratingCount: c.ratingCount,
    learners: c.learners,
    instructor: c.instructors[0]?.name ?? "W3Codify",
    image: c.thumbnail ?? "",
    accent: accentForSlug(c.slug),
  };
}

/** All published courses, ranked for the catalog/home (live + popular first). */
export async function getPublishedCourses() {
  return prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isLive: "desc" }, { learners: "desc" }],
    include: { instructors: { select: { name: true } } },
  });
}

export async function getPublishedCourseCards(): Promise<CourseCardData[]> {
  const courses = await getPublishedCourses();
  return courses.map(toCardData);
}

/** Full course detail (curriculum + instructors) for the single-course page. */
export async function getCourseBySlug(slug: string) {
  return prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      instructors: true,
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export async function getPublishedSlugs(): Promise<string[]> {
  const rows = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export type CourseDetail = NonNullable<
  Awaited<ReturnType<typeof getCourseBySlug>>
>;
