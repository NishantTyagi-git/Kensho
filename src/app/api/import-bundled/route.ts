import { NextResponse } from "next/server";
import { importBundledDataIntoRedis } from "@/server/db";

// Temporary: copies the bundled SQLite data into Redis once (guarded server-side), then gets removed.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    return NextResponse.json(await importBundledDataIntoRedis());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
