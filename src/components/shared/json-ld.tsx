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

/** Course + BreadcrumbList JSON-LD for a single-course page (§13). */
export function CourseJsonLd({
  title,
  description,
  slug,
  instructor,
  rating,
  ratingCount,
}: {
  title: string;
  description: string;
  slug: string;
  instructor: string;
  rating: number;
  ratingCount: number;
}) {
  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description,
    url: `${SITE.url}/courses/${slug}`,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      sameAs: SITE.url,
    },
    ...(instructor && {
      instructor: { "@type": "Person", name: instructor },
    }),
    ...(ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Courses", item: `${SITE.url}/courses` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE.url}/courses/${slug}` },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(course) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
