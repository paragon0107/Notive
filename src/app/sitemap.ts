import type { MetadataRoute } from "next";
import { fetchCategories, fetchPosts, fetchSeries } from "@/apis/notion/queries";
import { SITE_URL } from "@/libs/site-config";

const toAbsolute = (path: string) => new URL(path, SITE_URL).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, seriesList] = await Promise.all([
    fetchPosts(),
    fetchCategories(),
    fetchSeries(),
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

  const seriesCounts = new Map<string, number>();
  posts.forEach((post) => {
    if (post.series) {
      seriesCounts.set(
        post.series.slug,
        (seriesCounts.get(post.series.slug) ?? 0) + 1
      );
    }
  });

  return [
    { url: toAbsolute("/") },
    { url: toAbsolute("/posts") },
    { url: toAbsolute("/category") },
    ...posts.map((post) => ({ url: toAbsolute(`/post/${post.slug}`) })),
    ...categories
      .filter((category) => (categoryCounts.get(category.slug) ?? 0) > 0)
      .map((category) => ({ url: toAbsolute(`/category/${category.slug}`) })),
    ...seriesList
      .filter((series) => (seriesCounts.get(series.slug) ?? 0) > 0)
      .map((series) => ({ url: toAbsolute(`/series/${series.slug}`) })),
  ];
}
