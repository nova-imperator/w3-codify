import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default function ProfilePage() {
  return (
    <ComingSoon
      title="Your Profile"
      description="Basic info, professional details, your batches, and projects — with avatar upload. Lands next."
      session="Session 4"
    />
  );
}
