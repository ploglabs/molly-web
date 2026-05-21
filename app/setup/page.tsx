import { getSessionCookie, verifyToken } from "@/lib/auth/session";
import { getSessionToken } from "@/lib/db";
import { fetchUserGuilds, hasAdminAccess } from "@/lib/auth/discord";
import { SetupWizard } from "@/components/setup-wizard";

export default async function SetupPage() {
  const token = await getSessionCookie();
  let guilds: { id: string; name: string; icon: string | null; owner: boolean }[] = [];
  let discordId = "";

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      discordId = payload.userId;
      const accessToken = await getSessionToken(payload.sessionId);
      if (accessToken) {
        try {
          const allGuilds = await fetchUserGuilds(accessToken);

          let configuredGuildIds = new Set<string>();
          try {
            const RELAY_URL = process.env.RELAY_URL || "http://127.0.0.1:8080";
            const relayRes = await fetch(`${RELAY_URL}/api/guilds`, { cache: "no-store" });
            if (relayRes.ok) {
              const relayData = await relayRes.json();
              if (Array.isArray(relayData.guilds)) {
                relayData.guilds.forEach((g: { id: string }) => {
                  configuredGuildIds.add(g.id);
                });
              }
            }
          } catch (err) {
            console.error("Failed to fetch configured guilds from relay:", err);
          }

          guilds = allGuilds
            .filter(hasAdminAccess)
            .filter((g) => !configuredGuildIds.has(g.id))
            .map((g) => ({
              id: g.id,
              name: g.name,
              icon: g.icon,
              owner: g.owner,
            }));
        } catch {
          // User may not have guilds scope
        }
      }
    }
  }

  const clientId = process.env.DISCORD_CLIENT_ID;

  return (
    <div className="flex flex-1 items-center justify-center bg-[#050505] px-4 py-12 md:py-20 min-h-[calc(100vh-4rem)] w-full">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl font-mono uppercase">
            Setup Wizard
          </h1>
          <p className="mt-2 text-sm text-zinc-400 font-mono">
            Configure Molly to connect with your Discord server.
          </p>
        </div>

        <div className="rounded-none border-2 border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 shadow-2xl shadow-black/60">
          <SetupWizard guilds={guilds} discordId={discordId} clientId={clientId} />
        </div>
      </div>
    </div>
  );
}
