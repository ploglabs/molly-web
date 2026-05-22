"use client";

import Image from "next/image";
import { useState } from "react";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
}

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
        width={36}
        height={36}
        className="h-9 w-9 rounded-none border-2 border-zinc-800 object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-none border-2 border-[#5865F2] bg-[#5865F2]/10 text-xs font-bold text-[#5865F2] font-mono">
      {initials}
    </div>
  );
}

export function GuildPicker({
  guilds,
  clientId: propClientId,
}: {
  guilds: Guild[];
  clientId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (guilds.length === 0) {
    return (
      <div className="rounded-none border-2 border-dashed border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-400 font-mono">
        <svg className="mx-auto mb-3 h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        No servers found with admin access. Admin permission is required.
      </div>
    );
  }

  const selected = guilds.find((g) => g.id === selectedId);
  const clientId = propClientId || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

  return (
    <div className="flex flex-col gap-5 font-mono">
      <div>
        <label className="mb-2.5 block text-xs uppercase tracking-wider text-zinc-500">
          // SELECT DISCORD SERVER
        </label>
        <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto border-2 border-zinc-800 bg-zinc-950 p-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {guilds.map((guild) => {
            const isSelected = selectedId === guild.id;
            return (
              <button
                key={guild.id}
                onClick={() => setSelectedId(guild.id)}
                className={`flex items-center gap-3 rounded-none px-3.5 py-2.5 text-left text-sm transition-all duration-150 border ${
                  isSelected
                    ? "bg-[#5865F2]/10 border-[#5865F2] text-[#5865F2] font-bold"
                    : "hover:bg-zinc-900 border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <GuildIcon guild={guild} />
                <span className="flex-1 truncate font-semibold">{guild.name}</span>
                {guild.owner && (
                  <span className={`rounded-none border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? "bg-[#5865F2]/20 border-[#5865F2]/40 text-[#5865F2]"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  }`}>
                    Owner
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selected && clientId && (
        <a
          href={`https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${BOT_PERMISSIONS}&scope=bot&guild_id=${selected.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 rounded-none border-2 border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white px-4 py-3.5 text-sm font-bold transition-all duration-150 bg-transparent"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.88,6.83,77.19,77.19,0,0,0,49.58,0,105.15,105.15,0,0,0,19.14,8.07C3,32.22-1.42,55.8,1,79a105.77,105.77,0,0,0,32,16.29,78.89,78.89,0,0,0,6.76-11,68.6,68.6,0,0,1-10.63-5.13c.91-.67,1.8-1.37,2.65-2.1a75.46,75.46,0,0,0,63.15,0c.86.73,1.75,1.43,2.66,2.1a68.49,68.49,0,0,1-10.63,5.13,78.89,78.89,0,0,0,6.76,11,105.77,105.77,0,0,0,32-16.29C129.56,50.72,124.78,27.35,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
          </svg>
          INVITE BOT TO {selected.name.toUpperCase()}
        </a>
      )}
    </div>
  );
}
