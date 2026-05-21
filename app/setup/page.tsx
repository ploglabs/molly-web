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
    <main className="flex flex-col md:flex-row min-h-screen md:h-screen w-full md:overflow-hidden bg-[#090909]">
      {/* ── Left: description ── */}
      <div className="flex flex-col justify-between px-6 py-10 md:px-14 md:py-12 border-b md:border-b-0 md:border-r border-zinc-800/50 w-full md:w-[52%] order-2 md:order-1">
        <div className="flex flex-col justify-center flex-1 space-y-7 max-w-md">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-600 font-mono">
            a note from the molly team
          </p>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono">
              if you&apos;re new here
            </p>
            <p className="font-mono text-[12.5px] leading-[1.8] text-neutral-400">
              molly is a terminal-native discord client. discord is slow, heavy,
              and resource-hungry - a browser wrapped in electron, burning your
              ram just to chat. molly fixes that. open your terminal, type{" "}
              <span className="text-neutral-300">molly</span>, and you&apos;re
              in discord. no browser. no app. no bloat.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono">
              why we built it
            </p>
            <p className="font-mono text-[12.5px] leading-[1.8] text-neutral-400">
              we spend most of our time in the terminal already. switching to
              discord meant leaving that flow - opening a sluggish app with bad
              ux just to send a message. so we built molly: a proper TUI for
              discord that lives where we live. fast, keyboard-driven, and
              actually pleasant to use.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono">
              built in go · open source
            </p>
            <p className="font-mono text-[12.5px] leading-[1.8] text-neutral-400">
              molly is written in go using{" "}
              <span className="text-neutral-300">bubbletea</span> and{" "}
              <span className="text-neutral-300">lipgloss</span>. it&apos;s
              open source and we&apos;d love your contributions - whether
              that&apos;s fixing bugs, adding themes, improving the relay, or
              just starring the repo. the more people who help build it, the
              better it gets for everyone.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono">
              want to contribute?
            </p>
            <p className="font-mono text-[12.5px] leading-[1.8] text-neutral-400">
              pull requests are welcome. check the github, open an issue, or
              just start hacking. if you&apos;re unsure where to start, dm us
              and we&apos;ll help you find something worth working on.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="font-mono text-[10px] text-zinc-700 pt-6">
          © 2026 | made with ❤️ by{" "}
          <a
            href="https://github.com/ploglabs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-500 transition-colors"
          >
            Ploglabs
          </a>
        </p>
      </div>

      {/* ── Right: Setup Wizard ── */}
      <div className="flex flex-col items-center md:items-start justify-center flex-1 px-6 py-12 md:px-12 md:py-0 gap-8 order-1 md:order-2 w-full overflow-y-auto md:overflow-y-hidden">
        <div className="flex w-full max-w-lg flex-col gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl font-mono uppercase">
              Setup Wizard
            </h1>
            <p className="mt-2 text-sm text-zinc-400 font-mono">
              Configure Molly to connect with your Discord server.
            </p>
          </div>

          <div className="w-full">
            <SetupWizard guilds={guilds} discordId={discordId} clientId={clientId} />
          </div>
        </div>
      </div>
    </main>
  );
}
