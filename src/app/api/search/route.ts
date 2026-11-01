import { NextResponse, type NextRequest } from "next/server";
import { discover } from "@/server/discovery";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ error: "Enter a research topic to search." }, { status: 400 });
  if (q.length > 200) return NextResponse.json({ error: "That topic is too long — try a shorter phrase." }, { status: 400 });
  try {
    const result = await discover(q, { fresh: req.nextUrl.searchParams.get("fresh") === "1" });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: `TinyFish could not complete the search: ${(e as Error).message}` }, { status: 502 });
  }
}
