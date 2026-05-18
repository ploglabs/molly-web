import { NextResponse } from "next/server";
import { getSessionCookie, verifyToken } from "@/lib/auth/session";
import { getSessionToken } from "@/lib/db";
import { fetchUserGuilds, hasAdminAccess } from "@/lib/auth/discord";

export interface GuildResponse {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export async function GET() {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const accessToken = await getSessionToken(payload.sessionId);
  if (!accessToken) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  try {
    const guilds = await fetchUserGuilds(accessToken);
    const adminGuilds: GuildResponse[] = guilds
      .filter(hasAdminAccess)
      .map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        owner: g.owner,
        permissions: g.permissions,
      }));

    return NextResponse.json({ guilds: adminGuilds });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch guilds";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
