import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Served at /manifest.webmanifest (BUILD_SPEC §2 / God-Level #18 — installable PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Learn. Build. Get Placed.`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0A0A0B",
    theme_color: "#0A0A0B",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
