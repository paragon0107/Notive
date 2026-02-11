import { NextResponse } from "next/server";
import {
  fetchPostBlocks,
  fetchPostBySlug,
  fetchPosts,
  findPostBySlugFromList,
} from "@/apis/notion/queries/posts";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";
import { getOrSetMemoryCache } from "@/libs/server-memory-cache";

type Context = {
  params: { slug: string };
};

const POST_DETAIL_CACHE_TTL_MS = 30 * 1000;
const POST_DETAIL_CACHE_SECONDS = Math.floor(POST_DETAIL_CACHE_TTL_MS / 1000);

class PostNotFoundError extends Error {
  constructor() {
    super("Post not found.");
  }
}

const toPostDetailCacheKey = (slug: string) =>
  `api:blog:post:${slug.trim().toLowerCase()}`;

const loadPostDetailPayload = async (slug: string) => {
  const [databaseMap, posts, postBySlug] = await Promise.all([
    getDatabaseMap(),
    fetchPosts(),
    fetchPostBySlug(slug),
  ]);

  const post = postBySlug ?? findPostBySlugFromList(posts, slug);

  if (!post) {
    throw new PostNotFoundError();
  }

  const blocks = await fetchPostBlocks(post.id);

  return {
    databaseMap,
    posts,
    post,
    blocks,
  };
};

export async function GET(_: Request, context: Context) {
  try {
    const slug = context.params.slug;
    const payload = await getOrSetMemoryCache(
      toPostDetailCacheKey(slug),
      POST_DETAIL_CACHE_TTL_MS,
      () => loadPostDetailPayload(slug)
    );

    return NextResponse.json(
      payload,
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${POST_DETAIL_CACHE_SECONDS}, stale-while-revalidate=${POST_DETAIL_CACHE_SECONDS * 2}`,
        },
      },
    );
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to load post data.",
      },
      { status: 500 }
    );
  }
}
