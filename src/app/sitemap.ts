import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/courses", "/bootcamp", "/about", "/auth/signin", "/auth/signup"];
  return routes.map((route) => ({
    url: `${SITE.url}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
