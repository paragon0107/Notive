import type { Post } from "@/libs/types/blog";

export const buildSearchText = (
  post: Post,
  contentText: string,
  categoryNames: string[],
  seriesName?: string
) => {
  return [
    post.title,
    post.summary,
    contentText,
    categoryNames.join(" "),
    seriesName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};
