import { NextResponse } from "next/server";
import { getDiscordAuthUrl } from "@/lib/auth/discord";
import { randomBytes } from "node:crypto";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const url = getDiscordAuthUrl(state);

  const res = NextResponse.redirect(url);
  res.cookies.set("discord_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return res;
}
