import { ConvexHttpClient } from "convex/browser";

let client: ConvexHttpClient | null = null;

function getConvex(): Record<string, unknown> {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
    client = new ConvexHttpClient(url);
  }
  return client as unknown as Record<string, unknown>;
}

export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator: string;
  locale: string | null;
}

export async function upsertUser(user: DiscordUser) {
  const c = getConvex();
  await (c.mutation as CallableFunction)("users:upsertUser", {
    id: user.id,
    username: user.username,
    globalName: user.global_name,
    avatar: user.avatar,
    discriminator: user.discriminator,
    locale: user.locale,
  });
}

export async function getUserById(id: string): Promise<DiscordUser | null> {
  const c = getConvex();
  const user = await (c.query as CallableFunction)("users:getUserById", {
    discordId: id,
  });
  if (!user) return null;
  return {
    id: user.discordId as string,
    username: user.username as string,
    global_name: (user.globalName as string) ?? null,
    avatar: (user.avatar as string) ?? null,
    discriminator: user.discriminator as string,
    locale: (user.locale as string) ?? null,
  };
}

export async function createSession(
  sessionId: string,
  userId: string,
  discordAccessToken: string,
  expiresAt: Date
) {
  const c = getConvex();
  await (c.mutation as CallableFunction)("sessions:createSession", {
    sessionId,
    userId,
    discordAccessToken,
    expiresAt: expiresAt.getTime(),
  });
}

export async function getSession(sessionId: string) {
  const c = getConvex();
  const session = await (c.query as CallableFunction)("sessions:getSession", {
    sessionId,
  });
  if (!session) return null;
  return {
    id: session.discordId as string,
    username: session.username as string,
    global_name: (session.globalName as string) ?? null,
    avatar: (session.avatar as string) ?? null,
    discriminator: session.discriminator as string,
    locale: (session.locale as string) ?? null,
    expires_at: new Date(session.expiresAt as number).toISOString(),
  };
}

export async function deleteSession(sessionId: string) {
  const c = getConvex();
  await (c.mutation as CallableFunction)("sessions:deleteSession", {
    sessionId,
  });
}

export async function getSessionToken(sessionId: string): Promise<string | null> {
  const c = getConvex();
  const token = await (c.query as CallableFunction)("sessions:getSessionToken", {
    sessionId,
  });
  return token as string | null;
}

export async function cleanupExpiredSessions() {}
