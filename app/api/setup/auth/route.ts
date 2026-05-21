import { NextRequest, NextResponse } from "next/server";
import { fetchDiscordUser } from "@/lib/auth/discord";
import { createSession, upsertUser } from "@/lib/db";
import { createToken } from "@/lib/auth/session";
import { randomUUID } from "node:crypto";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=missing_token", request.url)
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

    const res = NextResponse.redirect(new URL("/setup", request.url));
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
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
