import type { Post } from "@/libs/types/blog";

export const buildSearchText = (
  post: Post,
  contentText: string,
  categoryNames: string[],
  seriesNames: string[] = []
) => {
  return [
    post.title,
    post.summary,
    contentText,
    categoryNames.join(" "),
    seriesNames.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};
