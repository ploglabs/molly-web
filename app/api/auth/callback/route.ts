import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, fetchDiscordUser } from "@/lib/auth/discord";
import { createSession, upsertUser } from "@/lib/db";
import { createToken } from "@/lib/auth/session";
import { randomUUID } from "node:crypto";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  const storedState = request.cookies.get("discord_oauth_state")?.value;
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", request.url)
    );
  }

  try {
    const token = await exchangeCode(code);
    const discordUser = await fetchDiscordUser(token.access_token);

    await upsertUser(discordUser);

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createSession(sessionId, discordUser.id, token.access_token, expiresAt);

    const jwt = await createToken(
      { userId: discordUser.id, sessionId },
      expiresAt
    );

    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.set("molly_session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
    res.cookies.delete("discord_oauth_state");

    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "auth_failed";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
