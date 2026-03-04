import { NextResponse } from "next/server";
import {
  BOOTSTRAP_REVALIDATE_SECONDS,
  getBlogBootstrapPayload,
} from "@/apis/blog/server/bootstrap";

export async function GET() {
  try {
    const payload = await getBlogBootstrapPayload();

    return NextResponse.json(
      payload,
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${BOOTSTRAP_REVALIDATE_SECONDS}, stale-while-revalidate=${BOOTSTRAP_REVALIDATE_SECONDS * 3}`,
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
