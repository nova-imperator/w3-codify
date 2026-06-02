import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <ComingSoon
      title="The course catalog"
      description="A fully searchable, DB-driven catalog with live filters is on the way — built from the admin panel with zero code changes."
      session="Session 2"
    />
  );
}
