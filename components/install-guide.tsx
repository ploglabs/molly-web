"use client";

import { useState, useEffect } from "react";

type Platform = "macos" | "linux" | "windows" | "go";

export function InstallGuide() {
  const [platform, setPlatform] = useState<Platform>("macos");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("mac")) {
      setPlatform("macos");
    } else if (ua.includes("win")) {
      setPlatform("windows");
    } else if (ua.includes("linux")) {
      setPlatform("linux");
    }
  }, []);

  const commands: Record<Platform, string> = {
    macos: "brew install ploglabs/tap/molly",
    linux: "yay -S molly-bin",
    windows: "scoop bucket add ploglabs https://github.com/ploglabs/scoop-bucket && scoop install molly",
    go: "go install github.com/ploglabs/molly-terminal/cmd/molly@latest",
  };

  const displayCommands: Record<Platform, React.ReactNode> = {
    macos: (
      <code className="text-zinc-300 block font-mono text-xs">
        brew install ploglabs/tap/molly
      </code>
    ),
    linux: (
      <div className="space-y-2">
        <div>
          <span className="text-[9px] text-zinc-600 block uppercase font-mono">// ARCH LINUX</span>
          <code className="text-zinc-300 block font-mono text-xs">yay -S molly-bin</code>
        </div>
        <div>
          <span className="text-[9px] text-zinc-600 block uppercase font-mono mt-1">// DEBIAN / UBUNTU</span>
          <code className="text-zinc-300 block font-mono text-xs">
            curl -LO https://github.com/ploglabs/molly-terminal/releases/latest/download/molly_linux_amd64.deb && sudo dpkg -i molly_linux_amd64.deb
          </code>
        </div>
        <div>
          <span className="text-[9px] text-zinc-600 block uppercase font-mono mt-1">// FEDORA / RHEL</span>
          <code className="text-zinc-300 block font-mono text-xs">
            curl -LO https://github.com/ploglabs/molly-terminal/releases/latest/download/molly_linux_amd64.rpm && sudo dnf install ./molly_linux_amd64.rpm
          </code>
        </div>
      </div>
    ),
    windows: (
      <code className="text-zinc-300 block font-mono text-xs whitespace-pre-line leading-relaxed">
        {`scoop bucket add ploglabs https://github.com/ploglabs/scoop-bucket\nscoop install molly`}
      </code>
    ),
    go: (
      <code className="text-zinc-300 block font-mono text-xs">
        go install github.com/ploglabs/molly-terminal/cmd/molly@latest
      </code>
    ),
  };

  const copyToClipboard = () => {
    const rawCommand = commands[platform];
    navigator.clipboard.writeText(rawCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md font-mono mt-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">// INSTALLATION GUIDE</span>
        <a href="/api/auth/logout" className="text-[10px] uppercase text-zinc-600 hover:text-zinc-400 transition-colors">
          [ LOGOUT ]
        </a>
      </div>

      {/* Tabs */}
      <div className="flex border border-zinc-800 bg-zinc-950 p-1 mb-3">
        {(["macos", "linux", "windows", "go"] as Platform[]).map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`flex-1 text-[10px] py-1.5 uppercase font-bold transition-all duration-150 rounded-none cursor-pointer ${
              platform === p
                ? "bg-neutral-200 text-neutral-900"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {p === "macos" ? "macOS" : p}
          </button>
        ))}
      </div>

      {/* Command Block */}
      <div className="relative border border-zinc-800 bg-zinc-950 p-4 min-h-[72px] flex items-center justify-between group">
        <div className="pr-16 w-full overflow-x-auto no-scrollbar">
          {displayCommands[platform]}
        </div>
        <button
          onClick={copyToClipboard}
          className="absolute right-4 top-4 text-[9px] uppercase tracking-wider text-zinc-500 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 px-2.5 py-1 transition-colors cursor-pointer"
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>

      {/* Run info */}
      <div className="mt-4 border border-zinc-800 bg-zinc-900/40 p-4">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-2">// QUICK START</span>
        <p className="text-xs text-zinc-400 leading-relaxed mb-3">
          Once installed, run molly in your shell. The configuration and setup wizard will run directly inside the terminal.
        </p>
        <div className="flex items-center justify-between border border-zinc-800 bg-zinc-950 px-3.5 py-2.5">
          <code className="text-xs text-emerald-400 font-bold">molly</code>
          <span className="text-[9px] text-zinc-500 uppercase font-bold">Run in shell</span>
        </div>
      </div>
    </div>
  );
}
