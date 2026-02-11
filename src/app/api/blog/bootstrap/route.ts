import { NextResponse } from "next/server";
import { fetchPosts } from "@/apis/notion/queries/posts";
import { fetchHomeConfig } from "@/apis/notion/queries/home";
import { fetchCategories } from "@/apis/notion/queries/collections";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import { getFallbackHomeConfig, normalizeHomeConfig } from "@/libs/home-config";
import { getOrSetMemoryCache } from "@/libs/server-memory-cache";

const BOOTSTRAP_CACHE_KEY = "api:blog:bootstrap:v1";
const BOOTSTRAP_CACHE_TTL_MS = 30 * 1000;
const BOOTSTRAP_CACHE_SECONDS = Math.floor(BOOTSTRAP_CACHE_TTL_MS / 1000);

const loadBootstrapPayload = async () => {
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

export async function GET() {
  try {
    const payload = await getOrSetMemoryCache(
      BOOTSTRAP_CACHE_KEY,
      BOOTSTRAP_CACHE_TTL_MS,
      loadBootstrapPayload
    );

    return NextResponse.json(
      payload,
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${BOOTSTRAP_CACHE_SECONDS}, stale-while-revalidate=${BOOTSTRAP_CACHE_SECONDS * 2}`,
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to load bootstrap data.",
      },
      { status: 500 }
    );
  }
}
