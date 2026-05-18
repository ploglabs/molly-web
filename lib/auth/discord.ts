import type { DiscordUser } from "@/lib/db";

const DISCORD_API = "https://discord.com/api/v10";
const ADMINISTRATOR = 0x8;
const MANAGE_GUILD = 0x20;

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export function getDiscordAuthUrl(state: string): string {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Missing DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds",
    state,
  });

  return `https://discord.com/api/oauth2/authorize?${params}`;
}

export async function exchangeCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Discord OAuth2 environment variables");
  }

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord token exchange failed: ${err}`);
  }

  return res.json();
}

export async function fetchDiscordUser(
  accessToken: string
): Promise<DiscordUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord user fetch failed: ${err}`);
  }

  return res.json();
}

export async function fetchUserGuilds(
  accessToken: string
): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord guilds fetch failed: ${err}`);
  }

  return res.json();
}

export function hasAdminAccess(guild: DiscordGuild): boolean {
  if (guild.owner) return true;
  const perms = BigInt(guild.permissions);
  return (perms & BigInt(ADMINISTRATOR)) !== BigInt(0) || (perms & BigInt(MANAGE_GUILD)) !== BigInt(0);
}
