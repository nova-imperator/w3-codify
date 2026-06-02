"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/session";
import { logAction } from "@/server/admin/audit";
import { slugify } from "@/lib/utils";
import type { BlockType, Prisma } from "@prisma/client";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function admin() {
  const user = await requireAdmin();
  return user.id;
}

function revalidateCatalog(slug?: string) {
  revalidatePath("/courses");
  revalidatePath("/");
  if (slug) revalidatePath(`/courses/${slug}`);
}

// ─────────────────────────── Courses ───────────────────────────
const courseSchema = z.object({
  title: z.string().trim().min(3).max(120),
  subtitle: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(10),
  thumbnail: z.string().trim().optional().or(z.literal("")),
  previewVideo: z.string().trim().optional().or(z.literal("")),
  priceInr: z.coerce.number().int().min(0),
  mrpInr: z.coerce.number().int().min(0),
  isLive: z.boolean(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  tags: z.array(z.string()),
  outcomes: z.array(z.string()),
  requirements: z.array(z.string()),
  instructorIds: z.array(z.string()),
});

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || "course";
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await prisma.course.findFirst({
      where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${++n}`;
  }
}

export async function createCourse(input: z.infer<typeof courseSchema>): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await admin();
    const data = courseSchema.parse(input);
    const slug = await uniqueSlug(slugify(data.title));
    const course = await prisma.course.create({
      data: {
        slug,
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description,
        thumbnail: data.thumbnail || null,
        previewVideo: data.previewVideo || null,
        priceInr: data.priceInr,
        mrpInr: data.mrpInr || null,
        isLive: data.isLive,
        level: data.level,
        tags: data.tags,
        outcomes: data.outcomes,
        requirements: data.requirements,
        instructors: { connect: data.instructorIds.map((id) => ({ id })) },
      },
    });
    await logAction(actorId, "create", "Course", course.id, { title: data.title });
    revalidatePath("/admin/courses");
    revalidateCatalog(slug);
    return { ok: true, data: { id: course.id } };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function updateCourse(id: string, input: z.infer<typeof courseSchema>): Promise<ActionResult> {
  try {
    const actorId = await admin();
    const data = courseSchema.parse(input);
    const existing = await prisma.course.findUnique({ where: { id }, select: { slug: true, title: true } });
    if (!existing) return { ok: false, error: "Course not found." };
    const slug =
      data.title !== existing.title ? await uniqueSlug(slugify(data.title), id) : existing.slug;
    await prisma.course.update({
      where: { id },
      data: {
        slug,
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description,
        thumbnail: data.thumbnail || null,
        previewVideo: data.previewVideo || null,
        priceInr: data.priceInr,
        mrpInr: data.mrpInr || null,
        isLive: data.isLive,
        level: data.level,
        tags: data.tags,
        outcomes: data.outcomes,
        requirements: data.requirements,
        instructors: { set: data.instructorIds.map((iid) => ({ id: iid })) },
      },
    });
    await logAction(actorId, "update", "Course", id);
    revalidatePath(`/admin/courses/${id}`);
    revalidatePath("/admin/courses");
    revalidateCatalog(slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function setCourseStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): Promise<ActionResult> {
  try {
    const actorId = await admin();
    const course = await prisma.course.update({ where: { id }, data: { status } });
    await logAction(actorId, "status", "Course", id, { status });
    revalidatePath("/admin/courses");
    revalidateCatalog(course.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  try {
    const actorId = await admin();
    const course = await prisma.course.delete({ where: { id } });
    await logAction(actorId, "delete", "Course", id, { title: course.title });
    revalidatePath("/admin/courses");
    revalidateCatalog(course.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

// ─────────────────────────── Sections ───────────────────────────
export async function createSection(
  courseId: string,
  title: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await admin();
    const count = await prisma.section.count({ where: { courseId } });
    const section = await prisma.section.create({
      data: { courseId, title: title.trim() || "New section", order: count },
    });
    return { ok: true, data: { id: section.id } };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function updateSection(id: string, title: string): Promise<ActionResult> {
  try {
    await admin();
    await prisma.section.update({ where: { id }, data: { title: title.trim() } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function deleteSection(id: string): Promise<ActionResult> {
  try {
    await admin();
    await prisma.section.delete({ where: { id } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function reorderSections(ids: string[]): Promise<ActionResult> {
  try {
    await admin();
    await prisma.$transaction(
      ids.map((id, order) => prisma.section.update({ where: { id }, data: { order } })),
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

// ─────────────────────────── Lessons ───────────────────────────
const lessonSchema = z.object({
  title: z.string().trim().min(1).max(160),
  durationSec: z.coerce.number().int().min(0).max(360000),
  isFreePreview: z.boolean(),
  videoUrl: z.string().trim().optional().or(z.literal("")),
});

export async function createLesson(
  sectionId: string,
  title: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await admin();
    const count = await prisma.lesson.count({ where: { sectionId } });
    const lesson = await prisma.lesson.create({
      data: { sectionId, title: title.trim() || "New lesson", order: count },
    });
    return { ok: true, data: { id: lesson.id } };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function updateLesson(id: string, input: z.infer<typeof lessonSchema>): Promise<ActionResult> {
  try {
    await admin();
    const data = lessonSchema.parse(input);
    await prisma.lesson.update({
      where: { id },
      data: {
        title: data.title,
        durationSec: data.durationSec,
        isFreePreview: data.isFreePreview,
        videoUrl: data.videoUrl || null,
      },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  try {
    await admin();
    await prisma.lesson.delete({ where: { id } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function reorderLessons(ids: string[]): Promise<ActionResult> {
  try {
    await admin();
    await prisma.$transaction(
      ids.map((id, order) => prisma.lesson.update({ where: { id }, data: { order } })),
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

// ─────────────────────────── Lesson blocks ───────────────────────────
export async function createBlock(
  lessonId: string,
  type: BlockType,
): Promise<ActionResult<{ id: string; data: Prisma.JsonValue }>> {
  try {
    await admin();
    const count = await prisma.lessonBlock.count({ where: { lessonId } });
    const defaults: Record<string, Prisma.InputJsonValue> = {
      TEXT: { md: "" },
      CODE: { lang: "javascript", code: "" },
      IMAGE: { caption: "", alt: "" },
      VIDEO: { url: "" },
      CALLOUT: { variant: "info", md: "" },
      QUIZ: { question: "", options: ["", ""], answer: 0 },
      FILE: {},
      EMBED: { url: "" },
    };
    const block = await prisma.lessonBlock.create({
      data: { lessonId, type, order: count, data: defaults[type] ?? {} },
    });
    return { ok: true, data: { id: block.id, data: block.data } };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function updateBlock(
  id: string,
  data: Record<string, unknown>,
  mediaId?: string | null,
): Promise<ActionResult> {
  try {
    await admin();
    await prisma.lessonBlock.update({
      where: { id },
      data: { data: data as Prisma.InputJsonValue, ...(mediaId !== undefined ? { mediaId } : {}) },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function deleteBlock(id: string): Promise<ActionResult> {
  try {
    await admin();
    await prisma.lessonBlock.delete({ where: { id } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function reorderBlocks(ids: string[]): Promise<ActionResult> {
  try {
    await admin();
    await prisma.$transaction(
      ids.map((id, order) => prisma.lessonBlock.update({ where: { id }, data: { order } })),
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

// ─────────────────────────── Instructors ───────────────────────────
const instructorSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  photo: z.string().trim().optional().or(z.literal("")),
});

export async function saveInstructor(
  id: string | null,
  input: z.infer<typeof instructorSchema>,
): Promise<ActionResult> {
  try {
    const actorId = await admin();
    const data = instructorSchema.parse(input);
    const payload = {
      name: data.name,
      role: data.role || null,
      bio: data.bio || null,
      photo: data.photo || null,
    };
    if (id) {
      await prisma.instructor.update({ where: { id }, data: payload });
      await logAction(actorId, "update", "Instructor", id);
    } else {
      const created = await prisma.instructor.create({ data: payload });
      await logAction(actorId, "create", "Instructor", created.id);
    }
    revalidatePath("/admin/instructors");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function deleteInstructor(id: string): Promise<ActionResult> {
  try {
    const actorId = await admin();
    await prisma.instructor.delete({ where: { id } });
    await logAction(actorId, "delete", "Instructor", id);
    revalidatePath("/admin/instructors");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

// ─────────────────────────── Leads ───────────────────────────
export async function updateLeadStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const actorId = await admin();
    await prisma.callbackLead.update({ where: { id }, data: { status } });
    await logAction(actorId, "status", "CallbackLead", id, { status });
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

// ─────────────────────────── Media ───────────────────────────
const mediaSchema = z.object({
  url: z.string().url(),
  alt: z.string().trim().max(200).optional().or(z.literal("")),
  caption: z.string().trim().max(200).optional().or(z.literal("")),
  kind: z.enum(["image", "video", "file"]).default("image"),
  tags: z.array(z.string()).default([]),
});

export async function createMedia(input: z.infer<typeof mediaSchema>): Promise<ActionResult> {
  try {
    const actorId = await admin();
    const data = mediaSchema.parse(input);
    const asset = await prisma.mediaAsset.create({
      data: {
        url: data.url,
        alt: data.alt || null,
        caption: data.caption || null,
        kind: data.kind,
        tags: data.tags,
        uploadedBy: actorId,
      },
    });
    await logAction(actorId, "create", "MediaAsset", asset.id);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  try {
    const actorId = await admin();
    await prisma.mediaAsset.delete({ where: { id } });
    await logAction(actorId, "delete", "MediaAsset", id);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

function msg(e: unknown): string {
  if (e instanceof Error && e.message === "UNAUTHORIZED") return "Not authorized.";
  if (e instanceof z.ZodError) return "Please check the form and try again.";
  return "Something went wrong. Please try again.";
}
