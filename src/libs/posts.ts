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

  const applyLimit = (items: Post[]) =>
    typeof limit === "number" ? items.slice(0, Math.max(0, limit)) : items;

  const postById = new Map(posts.map((post) => [post.id, post]));
  const directSeriesPosts = seriesIds
    .map((id) => postById.get(id))
    .filter((post): post is Post => Boolean(post))
    .filter((post) => post.id !== currentId);

  const uniqueDirectSeriesPosts = Array.from(
    new Map(directSeriesPosts.map((post) => [post.id, post])).values()
  );

  // Prefer direct relations (post-to-post). If not found, fallback to group-style series matching.
  if (uniqueDirectSeriesPosts.length > 0) {
    return applyLimit(uniqueDirectSeriesPosts);
  }

  const seriesSet = new Set(seriesIds);
  const groupedSeriesPosts = posts
    .filter((post) => post.id !== currentId)
    .filter((post) => post.series?.some((series) => seriesSet.has(series.id)));

  return applyLimit(groupedSeriesPosts);
};
