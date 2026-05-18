import Image from "next/image";
import { getUserById, getSessionToken } from "@/lib/db";
import { getSessionCookie, verifyToken } from "@/lib/auth/session";
import { fetchUserGuilds, hasAdminAccess } from "@/lib/auth/discord";
import { GuildPicker } from "@/components/guild-picker";
import { BotInfo } from "@/components/bot-info";

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
      >
        Logout
      </button>
    </form>
  );
}

async function getAdminGuilds(sessionId: string) {
  try {
    const accessToken = await getSessionToken(sessionId);
    if (!accessToken) return [];
    const guilds = await fetchUserGuilds(accessToken);
    return guilds.filter(hasAdminAccess).map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      owner: g.owner,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const token = await getSessionCookie();
  let user = null;
  let guilds: { id: string; name: string; icon: string | null; owner: boolean }[] = [];

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      user = await getUserById(payload.userId);
      guilds = await getAdminGuilds(payload.sessionId);
    }
  }

  return (
    <div className="flex flex-1 items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="flex w-full max-w-md flex-col gap-6">
        {user ? (
          <>
            <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md dark:bg-zinc-900">
              {user.avatar && (
                <Image
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.global_name || user.username}
                </p>
                {user.global_name && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    @{user.username}
                  </p>
                )}
              </div>
              <LogoutButton />
            </div>

            <BotInfo />

            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-zinc-900">
              <GuildPicker guilds={guilds} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-md dark:bg-zinc-900">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Welcome to molly
            </h1>
            <a
              href="/login"
              className="rounded-md bg-[#5865F2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4752C4]"
            >
              Sign in
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
