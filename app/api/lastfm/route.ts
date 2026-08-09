import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") || "7day";
  const key = process.env.LASTFM_APIKEY;
  const user = process.env.LASTFM_USERNAME;

  if (!key || !user) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${user}&api_key=${key}&format=json&limit=10&period=${period}`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
