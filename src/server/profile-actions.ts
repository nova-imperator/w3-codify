"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function uid(): Promise<string> {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u.id;
}

const basicSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().max(60).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  bio: z.string().trim().max(600).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  pincode: z.string().trim().max(12).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function updateBasicInfo(input: z.infer<typeof basicSchema>): Promise<ActionResult> {
  try {
    const id = await uid();
    const d = basicSchema.parse(input);
    if (d.email) {
      const taken = await prisma.user.findFirst({ where: { email: d.email, NOT: { id } } });
      if (taken) return { ok: false, error: "That email is already in use." };
    }
    await prisma.user.update({
      where: { id },
      data: {
        firstName: d.firstName,
        lastName: d.lastName || null,
        email: d.email || null,
        bio: d.bio || null,
        dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
        city: d.city || null,
        state: d.state || null,
        pincode: d.pincode || null,
        country: d.country || null,
      },
    });
    revalidatePath("/profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

const profSchema = z.object({
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
  college: z.string().trim().max(120).optional().or(z.literal("")),
  degree: z.string().trim().max(120).optional().or(z.literal("")),
  gradYear: z.coerce.number().int().min(1950).max(2100).optional(),
  skills: z.array(z.string()),
  githubUrl: z.string().trim().url().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().optional().or(z.literal("")),
});

export async function updateProfessional(input: z.infer<typeof profSchema>): Promise<ActionResult> {
  try {
    const id = await uid();
    const d = profSchema.parse(input);
    await prisma.user.update({
      where: { id },
      data: {
        jobTitle: d.jobTitle || null,
        company: d.company || null,
        experienceYears: d.experienceYears ?? null,
        college: d.college || null,
        degree: d.degree || null,
        gradYear: d.gradYear ?? null,
        skills: d.skills.map((s) => s.trim()).filter(Boolean),
        githubUrl: d.githubUrl || null,
        linkedinUrl: d.linkedinUrl || null,
        websiteUrl: d.websiteUrl || null,
      },
    });
    revalidatePath("/profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function setAvatar(url: string): Promise<ActionResult> {
  try {
    const id = await uid();
    if (url && !/^https?:\/\//.test(url) && !url.startsWith("/")) {
      return { ok: false, error: "Enter a valid image URL." };
    }
    await prisma.user.update({ where: { id }, data: { avatarUrl: url || null } });
    revalidatePath("/profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

const projectSchema = z.object({
  title: z.string().trim().min(2).max(120),
  repoUrl: z.string().trim().url().optional().or(z.literal("")),
  liveUrl: z.string().trim().url().optional().or(z.literal("")),
});

export async function addProject(input: z.infer<typeof projectSchema>): Promise<ActionResult> {
  try {
    const id = await uid();
    const d = projectSchema.parse(input);
    await prisma.project.create({
      data: { userId: id, title: d.title, repoUrl: d.repoUrl || null, liveUrl: d.liveUrl || null },
    });
    revalidatePath("/profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  try {
    const id = await uid();
    await prisma.project.deleteMany({ where: { id: projectId, userId: id } });
    revalidatePath("/profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
}

function msg(e: unknown): string {
  if (e instanceof Error && e.message === "UNAUTHORIZED") return "Please sign in.";
  if (e instanceof z.ZodError) return "Please check the form and try again.";
  return "Something went wrong. Please try again.";
}
