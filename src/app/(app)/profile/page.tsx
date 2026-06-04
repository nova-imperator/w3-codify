import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/server/profile";
import { isS3Configured } from "@/lib/s3";
import { ProfileClient, type ProfileData } from "@/components/profile/profile-client";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getMyProfile();
  if (!user) redirect("/auth/signin?callbackUrl=/profile");

  const data: ProfileData = {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    bio: user.bio ?? "",
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : "",
    city: user.city ?? "",
    state: user.state ?? "",
    pincode: user.pincode ?? "",
    country: user.country ?? "",
    avatarUrl: user.avatarUrl,
    jobTitle: user.jobTitle ?? "",
    company: user.company ?? "",
    experienceYears: user.experienceYears != null ? String(user.experienceYears) : "",
    college: user.college ?? "",
    degree: user.degree ?? "",
    gradYear: user.gradYear != null ? String(user.gradYear) : "",
    skills: user.skills,
    githubUrl: user.githubUrl ?? "",
    linkedinUrl: user.linkedinUrl ?? "",
    websiteUrl: user.websiteUrl ?? "",
    enrollments: user.enrollments.map((e) => ({
      slug: e.course.slug,
      title: e.course.title,
      type: e.type,
      status: e.status,
      isLive: e.course.isLive,
    })),
    projects: user.projects.map((p) => ({
      id: p.id,
      title: p.title,
      repoUrl: p.repoUrl,
      liveUrl: p.liveUrl,
      status: p.status,
      aiReview:
        p.aiReview && typeof p.aiReview === "object" && "feedback" in p.aiReview
          ? String((p.aiReview as { feedback: unknown }).feedback)
          : null,
    })),
  };

  return <ProfileClient data={data} s3Configured={isS3Configured()} />;
}
