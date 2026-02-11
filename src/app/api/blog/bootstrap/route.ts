import { NextResponse } from "next/server";
import { fetchPosts } from "@/apis/notion/queries/posts";
import { fetchHomeConfig } from "@/apis/notion/queries/home";
import { fetchCategories } from "@/apis/notion/queries/collections";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import { getFallbackHomeConfig, normalizeHomeConfig } from "@/libs/home-config";

export async function GET() {
  try {
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

    return NextResponse.json(
      {
        databaseMap,
        home: resolvedHome,
        posts,
      },
      { status: 200 }
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
