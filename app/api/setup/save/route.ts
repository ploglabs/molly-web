import { NextRequest, NextResponse } from "next/server";

const RELAY_URL = process.env.RELAY_URL || "http://127.0.0.1:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { discord_id, guild_id, guild_name, channel_id, channel_name } = body;
    if (!discord_id || !guild_id) {
      return NextResponse.json(
        { ok: false, error: "discord_id and guild_id are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${RELAY_URL}/api/setup/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        discord_id,
        guild_id,
        guild_name: guild_name || "",
        channel_id: channel_id || "",
        channel_name: channel_name || "",
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to save config on relay" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
