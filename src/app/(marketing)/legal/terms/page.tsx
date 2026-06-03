import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/legal/terms" } };

export default function TermsPage() {
  return (
    <ComingSoon
      title="Terms of Service"
      description="Our terms of service are being finalized and will be published here soon."
      session="a later session"
    />
  );
}
