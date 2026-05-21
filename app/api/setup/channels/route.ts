import { NextResponse } from "next/server";

const RELAY_URL = process.env.RELAY_URL || "http://127.0.0.1:8080";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guildId = searchParams.get("guild_id");

  if (!guildId) {
    return NextResponse.json({ error: "guild_id is required" }, { status: 400 });
  }

  const channelsURL = `${RELAY_URL}/api/guilds/${guildId}/channels`;
  try {
    const res = await fetch(channelsURL, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ channels: [] }, { status: 502 });
  }
}
