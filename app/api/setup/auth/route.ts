import { NextRequest, NextResponse } from "next/server";
import { fetchDiscordUser } from "@/lib/auth/discord";
import { createSession, upsertUser } from "@/lib/db";
import { createToken } from "@/lib/auth/session";
import { randomUUID } from "node:crypto";

function getBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL;
  if (configured) return configured;
  const url = new URL(request.url);
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  let token = "";
  try {
    const body = await request.json();
    token = body.token;
  } catch (e) {
    // Ignore JSON parse error, token will remain empty
  }

  if (!token) {
    return NextResponse.json(
      { error: "missing_token" },
      { status: 400 }
    );
  }

  try {
    const discordUser = await fetchDiscordUser(token);
    await upsertUser(discordUser);

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createSession(sessionId, discordUser.id, token, expiresAt);

    const jwt = await createToken(
      { userId: discordUser.id, sessionId },
      expiresAt
    );

    const res = NextResponse.json({ success: true, redirect: "/setup" });
    res.cookies.set("molly_session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "auth_failed";
    return NextResponse.json(
      { error: message, redirect: `/login?error=${encodeURIComponent(message)}` },
      { status: 401 }
    );
  }
}
