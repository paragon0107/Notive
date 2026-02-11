import type { MetadataRoute } from "next";
import { fetchCategories, fetchPosts } from "@/apis/notion/queries";
import { SITE_URL } from "@/libs/site-config";

const toAbsolute = (path: string) => new URL(path, SITE_URL).toString();
const getBaseSitemap = (): MetadataRoute.Sitemap => [
  { url: toAbsolute("/") },
  { url: toAbsolute("/category") },
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
      ...posts.map((post) => ({ url: toAbsolute(`/post/${post.slug}`) })),
      ...categories
        .filter((category) => (categoryCounts.get(category.slug) ?? 0) > 0)
        .map((category) => ({ url: toAbsolute(`/category/${category.slug}`) })),
    ];
  } catch (error) {
    console.error("[sitemap] Failed to fetch Notion content:", error);
    return getBaseSitemap();
  }
}
