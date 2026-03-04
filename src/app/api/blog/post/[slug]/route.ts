import { NextRequest, NextResponse } from "next/server";
import {
  getBlogPostDetailPayload,
  PostNotFoundError,
  POST_DETAIL_REVALIDATE_SECONDS,
} from "@/apis/blog/server/post-detail";

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: NextRequest, context: Context) {
  try {
    const { slug } = await context.params;
    const payload = await getBlogPostDetailPayload(slug);

    return NextResponse.json(
      payload,
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${POST_DETAIL_REVALIDATE_SECONDS}, stale-while-revalidate=${POST_DETAIL_REVALIDATE_SECONDS * 3}`,
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
