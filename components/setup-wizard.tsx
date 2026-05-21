"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
}

interface Channel {
  id: string;
  name: string;
}

type Step = "guild" | "invite" | "verify" | "channels" | "done";

const BOT_PERMISSIONS = 8;

function GuildIcon({ guild }: { guild: Guild }) {
  const initials = guild.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (guild.icon) {
    return (
      <Image
        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`}
        alt={guild.name}
        width={40}
        height={40}
        className="h-10 w-10 rounded-none border-2 border-zinc-800 object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-none border-2 border-[#5865F2] bg-[#5865F2]/10 text-sm font-bold text-[#5865F2] font-mono">
      {initials}
    </div>
  );
}

export function SetupWizard({
  guilds,
  discordId,
  clientId: propClientId,
}: {
  guilds: Guild[];
  discordId: string;
  clientId?: string;
}) {
  const [step, setStep] = useState<Step>("guild");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = guilds.find((g) => g.id === selectedId);
  const clientId = propClientId || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

  const goBack = () => {
    setError(null);
    if (step === "invite") {
      setStep("guild");
      setSelectedId(prevSelectedId);
    } else if (step === "verify") {
      setStep("invite");
    } else if (step === "channels") {
      setStep("invite");
      setSelectedChannel(null);
    }
  };

  const fetchChannels = useCallback(async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/setup/channels?guild_id=${selectedId}`);
      const data = await res.json();
      setChannels(data.channels || []);
    } catch {
      setError("Could not fetch channels.");
    }
  }, [selectedId]);

  const checkBot = useCallback(async () => {
    if (!selectedId) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/setup/check-bot?guild_id=${selectedId}`);
      const data = await res.json();
      if (data.bot_in_guild) {
        setStep("channels");
        fetchChannels();
      } else {
        setError("Bot not detected yet. Make sure you've invited it using the link above.");
      }
    } catch {
      setError("Could not reach the relay server. Make sure it's running.");
    }
    setChecking(false);
  }, [selectedId, fetchChannels]);

  const saveConfig = useCallback(async () => {
    if (!selected || !selectedChannel || !discordId) return;
    setSaving(true);
    setError(null);
    const channelName = channels.find((c) => c.id === selectedChannel)?.name || "";
    try {
      await fetch(`/api/setup/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discord_id: discordId,
          guild_id: selected.id,
          guild_name: selected.name,
          channel_id: selectedChannel,
          channel_name: channelName,
        }),
      });
      setStep("done");
    } catch {
      setError("Could not save configuration. Continuing anyway.");
      setStep("done");
    }
    setSaving(false);
  }, [selected, selectedChannel, discordId, channels]);

  const handleGuildSelect = (id: string) => {
    setPrevSelectedId(selectedId);
    setSelectedId(id);
    setStep("invite");
  };

  if (guilds.length === 0) {
    return (
      <div className="rounded-none border-2 border-dashed border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-400 font-mono">
        <svg className="mx-auto mb-3 h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        No servers found where user has admin access. Admin permission is required.
      </div>
    );
  }

  const stepsList: Step[] = ["guild", "invite", "verify", "channels", "done"];
  const currentIdx = stepsList.indexOf(step);

  return (
    <div className="flex flex-col gap-8 font-mono">
      {/* Stepper Header */}
      <div className="grid grid-cols-5 items-center gap-1 border-2 border-zinc-800 bg-zinc-950 p-3">
        {stepsList.map((s, i) => {
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
          return (
            <div key={s} className="flex flex-col items-center gap-1.5 relative">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-none text-xs font-bold transition-all duration-200 border-2 ${
                  isActive
                    ? "bg-[#5865F2] border-[#5865F2] text-white"
                    : isDone
                      ? "bg-zinc-900 border-emerald-500 text-emerald-500"
                      : "bg-zinc-900 border-zinc-800 text-zinc-600"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={`text-[9px] uppercase tracking-wider transition-colors duration-250 ${
                  isActive
                    ? "font-bold text-zinc-100"
                    : isDone
                      ? "text-emerald-500"
                      : "text-zinc-600"
                }`}
              >
                {s === "guild"
                  ? "Server"
                  : s === "invite"
                    ? "Invite"
                    : s === "verify"
                      ? "Verify"
                      : s === "channels"
                        ? "Channel"
                        : "Done"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Contents */}
      <div className="transition-all duration-300">
        {step === "guild" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-3 block text-xs uppercase tracking-wider text-zinc-500">
                // SELECT DISCORD SERVER
              </label>
              <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto border-2 border-zinc-800 bg-zinc-950 p-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {guilds.map((guild) => (
                  <button
                    key={guild.id}
                    onClick={() => handleGuildSelect(guild.id)}
                    className="flex items-center gap-3 rounded-none px-3.5 py-3 text-left text-sm transition-all duration-150 border border-zinc-900 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900"
                  >
                    <GuildIcon guild={guild} />
                    <span className="flex-1 truncate font-semibold text-zinc-200">{guild.name}</span>
                    {guild.owner && (
                      <span className="border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5">
                        Owner
                      </span>
                    )}
                    <span className="text-zinc-500 font-bold">&gt;&gt;</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "invite" && selected && clientId && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 border-2 border-zinc-800 bg-zinc-950 p-4">
              <GuildIcon guild={selected} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">// TARGET SERVER</p>
                <p className="text-sm font-bold text-zinc-200 truncate">{selected.name}</p>
              </div>
              {selected.owner && (
                <span className="border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5">
                  Owner
                </span>
              )}
            </div>

            <a
              href={`https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${BOT_PERMISSIONS}&scope=bot&guild_id=${selected.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 border-2 border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white px-5 py-3.5 text-sm font-bold transition-all duration-150 bg-transparent"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.88,6.83,77.19,77.19,0,0,0,49.58,0,105.15,105.15,0,0,0,19.14,8.07C3,32.22-1.42,55.8,1,79a105.77,105.77,0,0,0,32,16.29,78.89,78.89,0,0,0,6.76-11,68.6,68.6,0,0,1-10.63-5.13c.91-.67,1.8-1.37,2.65-2.1a75.46,75.46,0,0,0,63.15,0c.86.73,1.75,1.43,2.66,2.1a68.49,68.49,0,0,1-10.63,5.13,78.89,78.89,0,0,0,6.76,11,105.77,105.77,0,0,0,32-16.29C129.56,50.72,124.78,27.35,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
              INVITE BOT TO {selected.name.toUpperCase()}
            </a>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("verify")}
                className="flex-1 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black px-4 py-3 text-sm font-bold transition-all duration-150 bg-transparent cursor-pointer"
              >
                I'VE INVITED THE BOT - VERIFY
              </button>
              <button
                onClick={goBack}
                className="border-2 border-zinc-800 bg-transparent px-5 py-3 text-sm font-bold text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all duration-150"
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {step === "verify" && selected && (
          <div className="flex flex-col gap-5">
            <div className="border-2 border-blue-500/80 bg-blue-500/5 p-4 flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-blue-500 bg-blue-500/10 text-blue-400 text-xs font-bold">i</span>
              <p className="text-xs leading-relaxed text-blue-300">
                Checking if Molly bot has successfully joined <strong className="text-zinc-100">{selected.name}</strong>. This ensures relay connection is functional.
              </p>
            </div>

            {error && (
              <div className="border-2 border-amber-500/80 bg-amber-500/5 p-4 flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-amber-500 bg-amber-500/10 text-amber-400 text-xs font-bold">!</span>
                <p className="text-xs leading-relaxed text-amber-300">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={checkBot}
                disabled={checking}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white px-4 py-3 text-sm font-bold transition-all duration-150 bg-transparent disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {checking ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#5865F2]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    VERIFYING BOT PRESENCE...
                  </>
                ) : (
                  "CHECK BOT PRESENCE"
                )}
              </button>
              <button
                onClick={goBack}
                className="border-2 border-zinc-800 bg-transparent px-5 py-3 text-sm font-bold text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all duration-150"
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {step === "channels" && selected && (
          <div className="flex flex-col gap-5">
            <div className="border-2 border-emerald-500/80 bg-emerald-500/5 p-4 flex items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-emerald-500 bg-emerald-500/10 text-emerald-500 text-xs font-bold">✓</span>
              <p className="text-xs text-emerald-400">
                SUCCESS: Bot is connected to <strong className="text-zinc-100">{selected.name}</strong>.
              </p>
            </div>

            <div>
              <label className="mb-3 block text-xs uppercase tracking-wider text-zinc-500">
                // SELECT DEFAULT TEXT CHANNEL
              </label>
              {channels.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-8 text-xs text-zinc-500 border-2 border-dashed border-zinc-800 bg-zinc-950">
                  <svg className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>LOADING TEXT CHANNELS...</span>
                </div>
              ) : (
                <div className="flex max-h-60 flex-col gap-1.5 overflow-y-auto border-2 border-zinc-800 bg-zinc-950 p-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {channels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id)}
                      className={`flex items-center gap-3 rounded-none px-4 py-2.5 text-left text-sm transition-all duration-150 border ${
                        selectedChannel === ch.id
                          ? "bg-[#5865F2]/10 border-[#5865F2] text-[#5865F2] font-bold"
                          : "hover:bg-zinc-900 border-transparent text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className={selectedChannel === ch.id ? "text-[#5865F2]" : "text-zinc-600"}>#</span>
                      <span className="flex-1 truncate font-mono">{ch.name}</span>
                      {selectedChannel === ch.id && (
                        <span className="text-[#5865F2] font-bold">[SELECTED]</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveConfig}
                disabled={!selectedChannel || saving}
                className="flex-1 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black px-4 py-3 text-sm font-bold transition-all duration-150 bg-transparent disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-500 inline-block" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    SAVING CONFIGURATION...
                  </>
                ) : (
                  "COMPLETE SETUP"
                )}
              </button>
              <button
                onClick={goBack}
                className="border-2 border-zinc-800 bg-transparent px-5 py-3 text-sm font-bold text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all duration-150"
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-5 border-2 border-emerald-500 bg-emerald-500/5 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-emerald-500 bg-emerald-500/10 text-emerald-500 text-2xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100 uppercase">Setup Complete!</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Server [{selected?.name}] is now configured with Molly.
              </p>
              {selectedChannel && (
                <p className="mt-1 text-xs text-emerald-400 font-mono">
                  Default Channel: #{channels.find((c) => c.id === selectedChannel)?.name || "unknown"}
                </p>
              )}
            </div>

            <div className="mt-4 border-2 border-zinc-800 bg-zinc-950 p-4 text-left">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2.5">// NEXT STEPS</p>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Run <code className="text-zinc-200 font-bold">molly-terminal</code> to communicate with the bot in this Discord server.
              </p>
              <div className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-3.5 py-2.5">
                <code className="text-xs text-emerald-400">molly</code>
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Run in shell</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
