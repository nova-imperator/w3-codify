/**
 * Seed ONLY specific course slugs — safe to run on production.
 *
 *   pnpm tsx scripts/seed-courses.ts                       # default: the 2 new courses
 *   pnpm tsx scripts/seed-courses.ts prompt-engineering    # or explicit slugs
 *
 * Unlike prisma/seed.ts (which rebuilds EVERY course and reassigns lesson IDs),
 * this upserts and rebuilds sections/assessments for the named slugs ONLY, so
 * existing courses + their enrollment progress are untouched.
 * Prisma auto-loads .env, so DATABASE_URL is picked up automatically.
 */
import { PrismaClient, Level, CourseStatus, Prisma } from "@prisma/client";
import { COURSES, INSTRUCTORS, type LessonContent } from "../prisma/content";

const prisma = new PrismaClient();

const DEFAULT_SLUGS = ["prompt-engineering", "agentic-ai"];

/** Ordered multi-format blocks for one lesson (mirrors prisma/seed.ts). */
function blocksFor(course: { slug: string }, lesson: LessonContent): Prisma.LessonBlockCreateWithoutLessonInput[] {
  const imgUrl = `/images/lessons/${course.slug}/${lesson.slug}.png`;
  const docUrl = `/docs/${course.slug}/${lesson.slug}.md`;
  const blocks: Prisma.LessonBlockCreateWithoutLessonInput[] = [];
  let order = 0;

  blocks.push({ type: "TEXT", order: order++, data: { md: lesson.text } });
  if (lesson.code) {
    blocks.push({ type: "CODE", order: order++, data: { lang: lesson.code.lang, code: lesson.code.code } });
  }
  blocks.push({
    type: "IMAGE",
    order: order++,
    data: { alt: lesson.image.alt, caption: lesson.image.caption },
    media: { create: { url: imgUrl, kind: "image", alt: lesson.image.alt, caption: lesson.image.caption } },
  });
  if (lesson.exercise) {
    // The interactive code playground was removed: seed the (former) exercise as
    // a plain, read-only CODE block using its worked solution so the lesson keeps
    // a real code snippet.
    blocks.push({
      type: "CODE",
      order: order++,
      data: { lang: lesson.exercise.language, code: lesson.exercise.solution },
    });
  }
  if (lesson.callout) {
    blocks.push({ type: "CALLOUT", order: order++, data: { variant: lesson.callout.variant, md: lesson.callout.md } });
  }
  blocks.push({
    type: "FILE",
    order: order++,
    data: { label: lesson.doc.label },
    media: { create: { url: docUrl, kind: "file", alt: lesson.doc.label } },
  });
  for (const q of lesson.quizzes) {
    blocks.push({
      type: "QUIZ",
      order: order++,
      data: { question: q.question, options: q.options, answer: q.answer, why: q.why },
    });
  }
  return blocks;
}

async function main() {
  const slugs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SLUGS;
  const targets = COURSES.filter((c) => slugs.includes(c.slug));
  if (!targets.length) {
    console.error(`No matching courses for: ${slugs.join(", ")}`);
    process.exit(1);
  }

  // Upsert only the instructors used by the target courses.
  const instructorIds = new Set(targets.map((c) => c.instructorId));
  for (const i of INSTRUCTORS.filter((x) => instructorIds.has(x.id))) {
    await prisma.instructor.upsert({
      where: { id: i.id },
      update: { name: i.name, role: i.role, bio: i.bio, photo: i.photo, socials: i.socials },
      create: i,
    });
  }

  for (const c of targets) {
    const data = {
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      thumbnail: c.thumbnail,
      tags: c.tags,
      level: Level.ADVANCED,
      isLive: true,
      priceInr: 0,
      mrpInr: c.mrpInr,
      rating: c.rating,
      ratingCount: c.ratingCount,
      learners: c.learners,
      outcomes: c.outcomes,
      requirements: c.requirements,
      status: CourseStatus.PUBLISHED,
      instructors: { connect: [{ id: c.instructorId }] },
    };
    const course = await prisma.course.upsert({ where: { slug: c.slug }, update: data, create: data });

    // Rebuild THIS course's curriculum + assessments only.
    await prisma.section.deleteMany({ where: { courseId: course.id } });
    let lessons = 0;
    let blocks = 0;
    for (const [si, s] of c.sections.entries()) {
      await prisma.section.create({
        data: {
          courseId: course.id,
          title: s.title,
          order: si,
          lessons: {
            create: s.lessons.map((l, li) => {
              const b = blocksFor(c, l);
              lessons++;
              blocks += b.length;
              return {
                title: l.title,
                durationSec: l.min * 60,
                isFreePreview: l.free ?? false,
                videoUrl: l.video ?? null,
                order: li,
                blocks: { create: b },
              };
            }),
          },
        },
      });
    }

    await prisma.assessment.deleteMany({ where: { courseId: course.id } });
    for (const [ai, a] of c.assessments.entries()) {
      await prisma.assessment.create({
        data: {
          courseId: course.id,
          tier: a.tier,
          title: a.title,
          passPct: a.passPct,
          order: ai,
          questions: a.questions as unknown as Prisma.InputJsonValue,
        },
      });
    }

    console.log(`seeded: ${c.title} — ${c.sections.length} sections, ${lessons} lessons, ${blocks} blocks, ${c.assessments.length} assessments`);
  }

  console.log(`✓ seeded ${targets.length} course(s); existing courses untouched`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
