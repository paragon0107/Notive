import type { MetadataRoute } from "next";
import { fetchCategories, fetchPosts } from "@/apis/notion/queries";
import { SITE_URL } from "@/libs/site-config";

const toAbsolute = (path: string) => new URL(path, SITE_URL).toString();
const parseDate = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const getBaseSitemap = (): MetadataRoute.Sitemap => [
  {
    url: toAbsolute("/"),
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  },
  {
    url: toAbsolute("/category"),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [posts, categories] = await Promise.all([
      fetchPosts(),
      fetchCategories(),
    ]);

    const categoryCounts = new Map<string, number>();
    posts.forEach((post) => {
      post.categories.forEach((category) => {
        categoryCounts.set(
          category.slug,
          (categoryCounts.get(category.slug) ?? 0) + 1
        );
      });
    });

    return [
      ...getBaseSitemap(),
      ...posts.map((post) => ({
        url: toAbsolute(`/post/${post.slug}`),
        lastModified: parseDate(post.date) ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })),
      ...categories
        .filter((category) => (categoryCounts.get(category.slug) ?? 0) > 0)
        .map((category) => ({
          url: toAbsolute(`/category/${category.slug}`),
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        })),
    ];
  } catch (error) {
    console.error("[sitemap] Failed to fetch Notion content:", error);
    return getBaseSitemap();
  }
}
