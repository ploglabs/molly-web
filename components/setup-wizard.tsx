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
        className="h-10 w-10 rounded-none object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-none bg-zinc-900 text-sm font-bold text-zinc-400 font-mono">
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

  const botInviteUrl = selected && clientId
    ? `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${BOT_PERMISSIONS}&scope=bot&guild_id=${selectedId}`
    : null;

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
        setError(`bot_${selectedId}_not_in_guild`);
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
      <div className="border-l-2 border-zinc-700 bg-zinc-900/20 p-6 text-left text-xs text-zinc-500 font-mono">
        <svg className="mb-3 h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        No servers found where user has admin access. Admin permission is required.
      </div>
    );
  }

  const stepsList: Step[] = ["guild", "invite", "verify", "channels", "done"];
  const currentIdx = stepsList.indexOf(step);

  return (
    <div className="flex flex-col gap-6 font-mono text-xs">
      {/* Stepper Header */}
      <div className="grid grid-cols-5 items-center gap-1 bg-transparent p-0">
        {stepsList.map((s, i) => {
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
          return (
            <div key={s} className="flex flex-col items-center gap-1 relative">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-none text-[10px] font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-neutral-200 text-neutral-900"
                    : isDone
                      ? "bg-zinc-900 text-zinc-300"
                      : "bg-zinc-950 text-zinc-700"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={`text-[8px] uppercase tracking-wider transition-colors duration-250 ${
                  isActive
                    ? "font-bold text-zinc-200"
                    : isDone
                      ? "text-zinc-500"
                      : "text-zinc-700"
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
              <label className="mb-3 block text-[10px] uppercase tracking-wider text-zinc-650">
                // SELECT DISCORD SERVER
              </label>
              <div className="flex max-h-72 flex-col gap-1 overflow-y-auto bg-transparent p-0 no-scrollbar">
                {guilds.map((guild) => (
                  <button
                    key={guild.id}
                    onClick={() => handleGuildSelect(guild.id)}
                    className="flex items-center gap-3 rounded-none px-3.5 py-3 text-left text-xs transition-all duration-150 bg-zinc-900/30 hover:bg-zinc-900/70 cursor-pointer"
                  >
                    <GuildIcon guild={guild} />
                    <span className="flex-1 truncate font-semibold text-zinc-300">{guild.name}</span>
                    {guild.owner && (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900/80">
                        Owner
                      </span>
                    )}
                    <span className="text-zinc-600 font-bold">&gt;&gt;</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "invite" && selected && clientId && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 bg-zinc-900/30 p-4">
              <GuildIcon guild={selected} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-zinc-500">// TARGET SERVER</p>
                <p className="text-xs font-bold text-zinc-200 truncate">{selected.name}</p>
              </div>
              {selected.owner && (
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900/80">
                  Owner
                </span>
              )}
            </div>

            <a
              href={`https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${BOT_PERMISSIONS}&scope=bot&guild_id=${selected.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-neutral-200 text-neutral-900 hover:bg-white px-5 py-3.5 text-xs font-bold font-mono tracking-wider transition-colors text-center"
            >
              INVITE BOT TO {selected.name.toUpperCase()}
            </a>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("verify")}
                className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-neutral-300 hover:text-white px-4 py-3 text-xs font-bold font-mono transition-colors tracking-wider cursor-pointer"
              >
                VERIFY INSTALL
              </button>
              <button
                onClick={goBack}
                className="bg-transparent px-5 py-3 text-xs font-bold font-mono text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 transition-colors tracking-wider cursor-pointer"
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {step === "verify" && selected && (
          <div className="flex flex-col gap-5">
            <div className="border-l-2 border-zinc-700 bg-zinc-900/20 pl-4 py-2 flex items-start gap-3">
              <span className="text-zinc-500 text-xs font-bold">i</span>
              <p className="text-xs leading-relaxed text-zinc-400">
                Checking if Molly bot has successfully joined <strong className="text-zinc-200">{selected.name}</strong>. This ensures relay connection is functional.
              </p>
            </div>

            {error && (
              <div className="border-l-2 border-red-500/50 bg-red-950/10 pl-4 py-2 flex items-start gap-3">
                <span className="text-red-400 text-xs font-bold">!</span>
                <div>
                  <p className="text-xs leading-relaxed text-red-400">
                    Bot not detected yet. Make sure you have invited it:
                  </p>
                  {botInviteUrl && (
                    <a
                      href={botInviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs font-bold text-zinc-200 underline hover:text-white transition-colors"
                    >
                      INVITE BOT TO {selected.name.toUpperCase()}
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={checkBot}
                disabled={checking}
                className="flex-1 flex items-center justify-center gap-2 bg-neutral-200 text-neutral-900 hover:bg-white px-4 py-3 text-xs font-bold font-mono transition-colors tracking-wider disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {checking ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-neutral-900" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    VERIFYING...
                  </>
                ) : (
                  "CHECK BOT PRESENCE"
                )}
              </button>
              <button
                onClick={goBack}
                className="bg-transparent px-5 py-3 text-xs font-bold font-mono text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 transition-colors tracking-wider cursor-pointer"
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {step === "channels" && selected && (
          <div className="flex flex-col gap-5">
            <div className="border-l-2 border-zinc-700 bg-zinc-900/20 pl-4 py-2 flex items-center gap-3">
              <span className="text-zinc-400 text-xs font-bold">✓</span>
              <p className="text-xs text-zinc-400">
                SUCCESS: Bot is connected to <strong className="text-zinc-200">{selected.name}</strong>.
              </p>
            </div>

            <div>
              <label className="mb-3 block text-[10px] uppercase tracking-wider text-zinc-500">
                // SELECT DEFAULT TEXT CHANNEL
              </label>
              {channels.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-8 text-xs text-zinc-500 bg-zinc-900/20">
                  <svg className="animate-spin h-3 w-3 text-zinc-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>LOADING CHANNELS...</span>
                </div>
              ) : (
                <div className="flex max-h-60 flex-col gap-1 overflow-y-auto bg-transparent p-0 no-scrollbar">
                  {channels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id)}
                      className={`flex items-center gap-3 rounded-none px-4 py-2.5 text-left text-xs transition-all duration-150 ${
                        selectedChannel === ch.id
                          ? "bg-zinc-900 text-zinc-200 font-bold"
                          : "hover:bg-zinc-900/60 text-zinc-500 hover:text-zinc-300"
                      } cursor-pointer`}
                    >
                      <span className={selectedChannel === ch.id ? "text-zinc-300" : "text-zinc-700"}>#</span>
                      <span className="flex-1 truncate font-mono">{ch.name}</span>
                      {selectedChannel === ch.id && (
                        <span className="text-zinc-500 font-bold">[SELECTED]</span>
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
                className="flex-1 bg-neutral-200 text-neutral-900 hover:bg-white px-4 py-3 text-xs font-bold font-mono transition-colors tracking-wider disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-neutral-900 inline-block" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    SAVING...
                  </>
                ) : (
                  "COMPLETE SETUP"
                )}
              </button>
              <button
                onClick={goBack}
                className="bg-transparent px-5 py-3 text-xs font-bold font-mono text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 transition-colors tracking-wider cursor-pointer"
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-6 p-0 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center bg-zinc-900 text-zinc-300 text-xl font-bold rounded-full">
              ✓
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase">Setup Complete</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Server [{selected?.name}] is now configured with Molly.
              </p>
              {selectedChannel && (
                <p className="mt-1 text-xs text-zinc-400 font-mono">
                  Default Channel: #{channels.find((c) => c.id === selectedChannel)?.name || "unknown"}
                </p>
              )}
            </div>

            <div className="mt-4 bg-zinc-900/20 p-5 text-left">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2.5">// NEXT STEPS</p>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Run <code className="text-zinc-200 font-bold">molly</code> to communicate with the bot in this Discord server.
              </p>
              <div className="flex items-center justify-between bg-zinc-950 px-3.5 py-2.5">
                <code className="text-xs text-zinc-300 font-bold">molly</code>
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Run in shell</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
