import { unstable_cache } from "next/cache";
import { fetchPosts } from "@/apis/notion/queries/posts";
import { fetchHomeConfig } from "@/apis/notion/queries/home";
import { fetchCategories } from "@/apis/notion/queries/collections";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import { getFallbackHomeConfig, normalizeHomeConfig } from "@/libs/home-config";
import type { BlogBootstrapPayload } from "@/libs/types/blog-store";

export const BOOTSTRAP_REVALIDATE_SECONDS = 300;

const loadBootstrapPayload = async (): Promise<BlogBootstrapPayload> => {
  const [databaseMap, posts, home, categories] = await Promise.all([
    getDatabaseMap(),
    fetchPosts(),
    fetchHomeConfig(getFallbackHomeConfig()),
    fetchCategories(),
  ]);

  const normalizedHome = normalizeHomeConfig(home);
  const resolvedHome =
    normalizedHome.categories.length > 0
      ? normalizedHome
      : { ...normalizedHome, categories };

  return {
    databaseMap,
    home: resolvedHome,
    posts,
  };
};

const getCachedBootstrapPayload = unstable_cache(
  loadBootstrapPayload,
  ["blog:bootstrap:v2"],
  {
    revalidate: BOOTSTRAP_REVALIDATE_SECONDS,
    tags: ["blog-bootstrap"],
  }
);

export const getBlogBootstrapPayload = async (): Promise<BlogBootstrapPayload> =>
  getCachedBootstrapPayload();
