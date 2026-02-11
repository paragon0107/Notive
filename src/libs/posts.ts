import type { Post } from "@/libs/types/blog";

export const getPostNavigation = (posts: Post[], currentId: string) => {
  const index = posts.findIndex((post) => post.id === currentId);
  if (index === -1) {
    return { previous: undefined, next: undefined } as const;
  }
  return {
    previous: posts[index + 1],
    next: posts[index - 1],
  } as const;
};

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

export const filterPostsBySeriesSlug = (posts: Post[], slug: string) =>
  posts.filter((post) => post.series?.slug === slug);

export const sortPostsBySeriesOrder = (posts: Post[], postIds: string[]) => {
  if (postIds.length === 0) return posts;
  const orderMap = new Map(postIds.map((id, index) => [id, index]));
  return [...posts].sort((a, b) => {
    const orderA = orderMap.get(a.id);
    const orderB = orderMap.get(b.id);
    if (orderA === undefined && orderB === undefined) return 0;
    if (orderA === undefined) return 1;
    if (orderB === undefined) return -1;
    return orderA - orderB;
  });
};
