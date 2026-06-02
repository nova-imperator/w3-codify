import { SITE } from "@/lib/site";

/** Organization JSON-LD for the home page (BUILD_SPEC §13). */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    slogan: SITE.tagline,
    sameAs: [
      "https://youtube.com/@w3codify",
      "https://twitter.com/w3codify",
      "https://linkedin.com/company/w3codify",
    ],
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here (no user input).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
