import type { Post } from "@/libs/types/blog";

export const getRelatedPosts = (
  posts: Post[],
  categoryIds: string[],
  currentId: string,
  limit = 4
) => {
  if (categoryIds.length === 0) return [] as Post[];
  const categorySet = new Set(categoryIds);
  return posts
    .filter((post) => post.id !== currentId)
    .filter((post) => post.categories.some((category) => categorySet.has(category.id)))
    .slice(0, limit);
};

export const filterPostsByCategorySlug = (posts: Post[], slug: string) =>
  posts.filter((post) => post.categories.some((category) => category.slug === slug));

export const getSeriesPosts = (
  posts: Post[],
  seriesIds: string[],
  currentId: string,
  limit?: number
) => {
  if (seriesIds.length === 0) return [] as Post[];

  const seriesSet = new Set(seriesIds);
  const filtered = posts
    .filter((post) => post.id !== currentId)
    .filter((post) => post.series?.some((series) => seriesSet.has(series.id)));

  return limit ? filtered.slice(0, limit) : filtered;
};
