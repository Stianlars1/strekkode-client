import { BASE_URL } from "@/utils/constants";
import { MetadataRoute } from "next";

// Bump manually on real content changes so lastmod stays trustworthy.
const LAST_CONTENT_CHANGE = "2026-08-27";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: LAST_CONTENT_CHANGE,
      priority: 1,
      changeFrequency: "monthly",
    },
  ];
}
