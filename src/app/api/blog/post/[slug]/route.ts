import { NextResponse } from "next/server";
import { fetchPostBlocks, fetchPostBySlug, fetchPosts } from "@/apis/notion/queries/posts";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";

type Context = {
  params: { slug: string };
};

export async function GET(_: Request, context: Context) {
  try {
    const slug = context.params.slug;
    const [databaseMap, posts, postBySlug] = await Promise.all([
      getDatabaseMap(),
      fetchPosts(),
      fetchPostBySlug(slug),
    ]);

    const post = postBySlug ?? posts.find((item) => item.slug === slug);

    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    const blocks = await fetchPostBlocks(post.id);

    return NextResponse.json(
      {
        databaseMap,
        posts,
        post,
        blocks,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to load post data.",
      },
      { status: 500 }
    );
  }
}
