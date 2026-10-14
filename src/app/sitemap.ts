import { BASE_URL } from "@/utils/constants";
import { MetadataRoute } from "next";

// Bump manually on real content changes so lastmod stays trustworthy.
const LAST_CONTENT_CHANGE = "2026-10-14";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: LAST_CONTENT_CHANGE,
      priority: 1,
      changeFrequency: "monthly",
    },
    {
      url: `${BASE_URL}/personvern`,
      lastModified: LAST_CONTENT_CHANGE,
      priority: 0.3,
      changeFrequency: "yearly",
    },
    {
      url: `${BASE_URL}/veiledning`,
      lastModified: LAST_CONTENT_CHANGE,
      priority: 0.7,
      changeFrequency: "yearly",
    },
  ];
}
