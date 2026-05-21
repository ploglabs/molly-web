import { Tagline } from "@/components/tagline";
import { pickRandomTagline } from "@/lib/taglines";
import { MollyAscii } from "@/components/molly-ascii";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const tagline = pickRandomTagline();

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

      {/* ── Right: ASCII art + tagline + CTA ── */}
      <div className="flex flex-col items-start justify-center flex-1 px-6 py-12 md:px-12 md:py-0 gap-8 order-1 md:order-2 w-full">
        <MollyAscii />

        <Tagline lines={tagline} />

        {error && (
          <div className="border border-red-500/50 bg-red-950/20 p-4 text-xs font-mono text-red-400 w-full max-w-sm">
            <span className="font-bold uppercase tracking-wider block mb-1">// AUTHENTICATION ERROR</span>
            {error === "access_denied"
              ? "You denied the authorization request."
              : `Authentication failed: ${decodeURIComponent(error)}`}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <a
            href="/api/auth/login"
            className="flex items-center justify-center gap-3 bg-[#5865F2] text-white px-8 py-3 text-xs font-bold font-mono hover:bg-[#4752C4] transition-colors tracking-wider text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 127.14 96.36"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
            LOGIN WITH DISCORD
          </a>
        </div>

        <p className="font-mono text-[10px] text-zinc-600 max-w-xs leading-relaxed">
          // By signing in, you agree to let molly access your Discord username and avatar.
        </p>
      </div>
    </main>
  );
}
