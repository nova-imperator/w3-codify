import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/legal/privacy" } };

export default function PrivacyPage() {
  return (
    <ComingSoon
      title="Privacy Policy"
      description="Our full privacy policy is being finalized. We take your data seriously — details coming soon."
      session="a later session"
    />
  );
}
