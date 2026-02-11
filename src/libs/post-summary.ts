import type { Post, PostSummary } from "@/libs/types/blog";
import { buildSearchText } from "@/libs/notion/search";
import { extractPlainText } from "@/libs/notion/blocks";
import type { BlockNode } from "@/libs/notion/blocks";

export const buildPostSummary = (
  post: Post,
  blocks: BlockNode[]
): PostSummary => {
  const contentText = extractPlainText(blocks);
  const categoryNames = post.categories.map((category) => category.name);
  return {
    ...post,
    searchText: buildSearchText(
      post,
      contentText,
      categoryNames,
      post.series?.name
    ),
  };
};

export const buildPostSummaries = (
  posts: Post[],
  blocksByPostId: Map<string, BlockNode[]>
): PostSummary[] =>
  posts.map((post) =>
    buildPostSummary(post, blocksByPostId.get(post.id) ?? [])
  );
