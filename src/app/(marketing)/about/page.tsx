import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "About Us", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <ComingSoon
      title="About W3Codify"
      description="Our story, our mission, and the team building the AI-powered school of the future. Full page coming soon."
      session="a later session"
    />
  );
}
