import { NextResponse } from "next/server";
import { getSessionCookie, verifyToken } from "@/lib/auth/session";
import { getUserById } from "@/lib/db";

export async function GET() {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      globalName: user.global_name,
      avatar: user.avatar,
      discriminator: user.discriminator,
      locale: user.locale,
    },
  });
}
