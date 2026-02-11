import type { Post, PostSummary } from "@/libs/types/blog";
import { buildSearchText } from "@/libs/notion/search";

export const buildPostSummary = (
  post: Post,
  contentText = ""
): PostSummary => {
  const categoryNames = post.categories.map((category) => category.name);
  const seriesNames = post.series?.map((series) => series.name) ?? [];
  return {
    ...post,
    searchText: buildSearchText(
      post,
      contentText,
      categoryNames,
      seriesNames
    ),
  };
};

export const buildPostSummaries = (posts: Post[]): PostSummary[] =>
  posts.map((post) => buildPostSummary(post, post.summary ?? ""));
