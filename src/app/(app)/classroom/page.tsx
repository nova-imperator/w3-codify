import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Classroom", robots: { index: false } };

export default function ClassroomPage() {
  return (
    <ComingSoon
      title="Your Classroom"
      description="Your enrolled courses, progress, the lesson player, and the in-context AI tutor arrive here."
      session="Session 5"
    />
  );
}
