import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Bootcamp", alternates: { canonical: "/bootcamp" } };

export default function BootcampPage() {
  return (
    <ComingSoon
      title="The Bootcamp"
      description="Our intensive, placement-focused cohort. Landing page with curriculum, schedule, and outcomes coming soon."
      session="a later session"
    />
  );
}
