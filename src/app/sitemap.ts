import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", ...projects.map((p) => `/projects/${p.slug}`)].map((path) => ({ url: `${site.url}${path}` }));
}
