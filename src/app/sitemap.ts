import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getPublishedSlugs } from "@/server/courses";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/courses", "/about", "/auth/signin"];
  const base: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE.url}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getPublishedSlugs();
    courseRoutes = slugs.map((slug) => ({
      url: `${SITE.url}/courses/${slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // DB unreachable at build — ship the static routes rather than failing.
  }

  return [...base, ...courseRoutes];
}
