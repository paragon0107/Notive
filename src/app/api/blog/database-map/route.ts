import { NextResponse } from "next/server";
import { getDatabaseMap } from "@/apis/notion/queries/database-map";

export async function GET() {
  try {
    const databaseMap = await getDatabaseMap();
    return NextResponse.json({ databaseMap }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to load database map.",
      },
      { status: 500 }
    );
  }
}
