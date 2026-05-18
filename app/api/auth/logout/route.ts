import { NextResponse } from "next/server";
import { getSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { verifyToken } from "@/lib/auth/session";
import { deleteSession } from "@/lib/db";

export async function POST() {
  const token = await getSessionCookie();
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      await deleteSession(payload.sessionId);
    }
  }

  await clearSessionCookie();

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}

export async function GET() {
  const token = await getSessionCookie();
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      await deleteSession(payload.sessionId);
    }
  }

  await clearSessionCookie();

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
