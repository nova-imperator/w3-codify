import { NextResponse } from "next/server";
import { getPublishedCourseCards } from "@/server/courses";
import { coursesQuerySchema } from "@/server/validators";
import { courseMatchesQuery } from "@/lib/search";

export const revalidate = 300;

// GET /api/courses?tag&level&q  -> filtered list of course cards (§9).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = coursesQuerySchema.safeParse({
    tag: searchParams.get("tag") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { tag, level, q } = parsed.data;
  try {
    let cards = await getPublishedCourseCards();
    if (level) cards = cards.filter((c) => c.level.toUpperCase() === level);
    if (tag) {
      const t = tag.toLowerCase();
      cards = cards.filter((c) => c.tags.some((x) => x.toLowerCase() === t));
    }
    if (q) {
      cards = cards.filter((c) =>
        courseMatchesQuery(
          { title: c.title, blurb: c.blurb, instructor: c.instructor, tags: c.tags },
          q,
        ),
      );
    }
    return NextResponse.json({ courses: cards, count: cards.length });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
