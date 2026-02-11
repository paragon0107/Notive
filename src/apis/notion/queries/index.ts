import type { Post, PostSummary } from "@/libs/types/blog";
import { buildSearchText } from "@/libs/notion/search";
import { getFallbackHomeConfig, normalizeHomeConfig } from "@/libs/home-config";
import { fetchHomeConfig } from "@/apis/notion/queries/home";
import {
  fetchPostBlocks,
  fetchPostBySlug,
  fetchPosts,
} from "@/apis/notion/queries/posts";
import { fetchCategories, fetchSeries } from "@/apis/notion/queries/collections";

const toSummary = (post: Post): PostSummary => {
  const categoryNames = post.categories.map((category) => category.name);
  return {
    ...post,
    searchText: buildSearchText(post, "", categoryNames, post.series?.name),
  };
};

export const fetchHomePageData = async () => {
  const [posts, home, categories] = await Promise.all([
    fetchPosts(),
    fetchHomeConfig(getFallbackHomeConfig()),
    fetchCategories(),
  ]);

  const normalizedHome = normalizeHomeConfig(home);
  const resolvedHome =
    normalizedHome.categories.length > 0
      ? normalizedHome
      : { ...normalizedHome, categories };
  const summaries = posts.map(toSummary);

  return {
    home: resolvedHome,
    posts: summaries,
  };
};

export {
  fetchHomeConfig,
  fetchPosts,
  fetchPostBySlug,
  fetchPostBlocks,
  fetchCategories,
  fetchSeries,
};
