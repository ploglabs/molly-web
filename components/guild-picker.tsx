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
        width={32}
        height={32}
        className="h-8 w-8 rounded-full"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5865F2] text-xs font-bold text-white">
      {initials}
    </div>
  );
}

export function GuildPicker({ guilds }: { guilds: Guild[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (guilds.length === 0) {
    return (
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
        No servers found where you have admin access. You need Manage Server or Administrator permission in a server to invite the bot.
      </div>
    );
  }

  const selected = guilds.find((g) => g.id === selectedId);
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Select a server
        </label>
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border border-zinc-200 p-1 dark:border-zinc-700">
          {guilds.map((guild) => (
            <button
              key={guild.id}
              onClick={() => setSelectedId(guild.id)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                selectedId === guild.id
                  ? "bg-[#5865F2] text-white"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <GuildIcon guild={guild} />
              <span className="flex-1 truncate font-medium">{guild.name}</span>
              {guild.owner && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    selectedId === guild.id
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  Owner
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {selected && clientId && (
        <a
          href={`https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${BOT_PERMISSIONS}&scope=bot&guild_id=${selected.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-md bg-[#5865F2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4752C4]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.009-1.252-.242-1.865-.442-.75-.244-1.348-.373-1.296-.788.027-.215.324-.436.891-.663 3.498-1.524 5.83-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.1-.002.321.023.465.14.121.098.155.228.171.322.016.098.036.32.02.496z" />
          </svg>
          Invite molly bot to {selected.name}
        </a>
      )}
    </div>
  );
}
