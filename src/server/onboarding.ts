"use server";

import type { Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";
import { normalizePhone, isValidPhone } from "@/lib/otp";

const GENDERS: readonly Gender[] = ["MALE", "FEMALE", "UNSPECIFIED"];

/** Whether to show the first-login welcome step (Name + Contact). */
export async function getOnboardingStatus(): Promise<{ needsOnboarding: boolean }> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) return { needsOnboarding: false };
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { onboardedAt: true },
  });
  return { needsOnboarding: !!user && user.onboardedAt === null };
}

export type OnboardingResult = { ok: true } | { ok: false; error: string };

/**
 * Complete (or skip) the first-login onboarding. Always marks onboardedAt so it
 * never shows again; saves name/contact when provided. Never blocks entry.
 */
export async function completeOnboarding(input: {
  skip?: boolean;
  name?: string;
  phone?: string;
  gender?: Gender;
}): Promise<OnboardingResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) return { ok: false, error: "Please sign in." };

  const data: {
    onboardedAt: Date;
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: Gender;
  } = {
    onboardedAt: new Date(),
  };

  if (!input.skip) {
    if (input.gender && GENDERS.includes(input.gender)) data.gender = input.gender;
    const name = (input.name ?? "").trim();
    if (name) {
      const [first, ...rest] = name.split(/\s+/);
      data.firstName = first.slice(0, 60);
      if (rest.length) data.lastName = rest.join(" ").slice(0, 60);
    }
    const phoneRaw = (input.phone ?? "").trim();
    if (phoneRaw) {
      const phone = normalizePhone(phoneRaw);
      if (!isValidPhone(phone)) return { ok: false, error: "Enter a valid 10-digit phone number." };
      // Don't collide with another account's phone.
      const taken = await prisma.user.findFirst({
        where: { phone, NOT: { id: sessionUser.id } },
        select: { id: true },
      });
      if (taken) return { ok: false, error: "That phone number is already in use." };
      data.phone = phone;
    }
  }

  await prisma.user.update({ where: { id: sessionUser.id }, data });
  return { ok: true };
}
