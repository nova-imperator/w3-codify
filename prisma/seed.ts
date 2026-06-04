/**
 * Seed the 3 launch courses (BUILD_SPEC §7.1, §6.8.1) with instructors,
 * multi-format interactive lessons, and tier + final assessments.
 *
 * Content lives in prisma/content.ts (shared with the asset generator).
 * Idempotent: courses upsert by slug; instructors upsert by fixed id;
 * a course's sections + assessments are rebuilt each run.
 * Everything is FREE during launch (priceInr = 0).
 */
import { PrismaClient, Level, CourseStatus, Prisma } from "@prisma/client";
import { COURSES, INSTRUCTORS, type LessonContent } from "./content";

const prisma = new PrismaClient();

/** Build the ordered, multi-format content blocks for one lesson. */
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
  for (const i of INSTRUCTORS) {
    await prisma.instructor.upsert({
      where: { id: i.id },
      update: { name: i.name, role: i.role, bio: i.bio, photo: i.photo, socials: i.socials },
      create: i,
    });
  }

  for (const c of COURSES) {
    const data = {
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      thumbnail: c.thumbnail,
      tags: c.tags,
      level: Level.ADVANCED,
      isLive: true,
      priceInr: 0, // Launch offer — free for now (paid + Razorpay re-activate later)
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

    // Rebuild curriculum (cascade removes old sections/lessons/blocks/media links).
    await prisma.section.deleteMany({ where: { courseId: course.id } });
    let lessonCount = 0;
    let blockCount = 0;
    for (const [si, s] of c.sections.entries()) {
      await prisma.section.create({
        data: {
          courseId: course.id,
          title: s.title,
          order: si,
          lessons: {
            create: s.lessons.map((l, li) => {
              const blocks = blocksFor(c, l);
              lessonCount++;
              blockCount += blocks.length;
              return {
                title: l.title,
                durationSec: l.min * 60,
                isFreePreview: l.free ?? false,
                videoUrl: l.video ?? null,
                order: li,
                blocks: { create: blocks },
              };
            }),
          },
        },
      });
    }

    // Rebuild assessments (tier mini-assessments + final).
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

    console.log(
      `seeded: ${c.title} — ${c.sections.length} sections, ${lessonCount} lessons, ${blockCount} blocks, ${c.assessments.length} assessments`,
    );
  }

  await seedFeatureFlags();
  await seedAdminAndDemo();
  console.log("✓ seed complete");
}

// Idempotent feature-flag seed. Keep keys + defaults in sync with
// src/server/flags.ts (FLAG_DEFS); never clobber an admin-set `enabled`.
async function seedFeatureFlags() {
  const flags: { key: string; enabled: boolean; description: string }[] = [
    { key: "maintenance_mode", enabled: false, description: "Show a friendly maintenance page to everyone except admins." },
    { key: "new_signups", enabled: true, description: "Allow new accounts to be created at sign-in. Existing users always sign in." },
    { key: "paid_pricing", enabled: false, description: "Show real prices and checkout. When off, every course is FREE (launch offer)." },
    { key: "ai_tutor", enabled: true, description: "Show the context-aware AI tutor inside lessons." },
    { key: "chatbot", enabled: true, description: "Show the floating site assistant on every page." },
    { key: "course_reviews", enabled: false, description: "Reserved for a future student reviews feature." },
  ];
  for (const f of flags) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      create: f,
      update: { description: f.description },
    });
  }
  console.log(`feature flags: ${flags.length}`);
}

// Admin account + demo students/enrollments/leads so the panel is populated.
async function seedAdminAndDemo() {
  // SECURITY: no hardcoded admin is seeded — the old public one (phone 9000000001 /
  // bradforbes24@hotmail.com) was an admin-takeover risk. Sign in normally, then have an
  // admin promote your account (role = ADMIN). Demo users/leads only seed when SEED_DEMO=true.
  if (process.env.SEED_DEMO !== "true") {
    console.log("SEED_DEMO not set — skipping demo users/leads (no admin seeded)");
    return;
  }

  const demoStudents = [
    { phone: "9810000001", firstName: "Priya", lastName: "Sharma", email: "priya.demo@w3codify.com", slug: "machine-learning-deep-learning" },
    { phone: "9810000002", firstName: "Karthik", lastName: "R", email: "karthik.demo@w3codify.com", slug: "cloud-computing" },
    { phone: "9810000003", firstName: "Ananya", lastName: "Gupta", email: "ananya.demo@w3codify.com", slug: "cyber-security" },
    { phone: "9810000004", firstName: "Dev", lastName: "Mehra", email: "dev.demo@w3codify.com", slug: "machine-learning-deep-learning" },
  ];
  for (const s of demoStudents) {
    const user = await prisma.user.upsert({
      where: { phone: s.phone },
      update: { firstName: s.firstName, lastName: s.lastName },
      create: {
        phone: s.phone,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phoneVerified: true,
        role: "STUDENT",
      },
    });
    const course = await prisma.course.findUnique({ where: { slug: s.slug } });
    if (course) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
        update: {},
        create: {
          userId: user.id,
          courseId: course.id,
          type: course.priceInr > 0 ? "PAID" : "FREE",
        },
      });
    }
  }
  console.log(`demo students: ${demoStudents.length}`);

  const demoLeads = [
    { id: "lead_demo_1", name: "Rahul Nair", phone: "9820011111", enquiryFor: "Online Course (Website)", message: "Interested in the ML cohort — when's the next batch?", status: "new" },
    { id: "lead_demo_2", name: "Meera Iyer", phone: "9820022222", enquiryFor: "Online Course (Website)", message: "Do you offer EMI for the Career Track?", status: "contacted" },
    { id: "lead_demo_3", name: "Sahil Kapoor", phone: "9820033333", enquiryFor: "Offline Course", message: "Looking for weekend batches in Mumbai.", status: "new" },
    { id: "lead_demo_4", name: "Tanvi Desai", phone: "9820044444", enquiryFor: "Online Course (Website)", message: "Enrolled — thanks for the quick callback!", status: "closed" },
  ];
  for (const l of demoLeads) {
    await prisma.callbackLead.upsert({
      where: { id: l.id },
      update: { status: l.status },
      create: l,
    });
  }
  console.log(`demo leads: ${demoLeads.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
