import Link from "next/link";
import Image from "next/image";
import { getSessionCookie, verifyToken } from "@/lib/auth/session";
import { getUserById } from "@/lib/db";

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="rounded bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700 font-mono"
      >
        Logout
      </button>
    </form>
  );
}

export async function Navbar() {
  const token = await getSessionCookie();
  let user = null;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      user = await getUserById(payload.userId);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#050505] border-b border-zinc-800/80">
      <div className="flex h-16 items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-3"
        >
          <Image
            src="/logo.jpg"
            alt="Molly"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          molly
        </Link>

        {/* Center Links matching the image */}
        <div className="hidden md:flex items-center gap-8 font-mono text-[13px] text-zinc-400">
          <Link href="#" className="hover:text-white transition-colors">GitHub [160K]</Link>
          <Link href="#" className="hover:text-white transition-colors">Docs</Link>
          <Link href="#" className="hover:text-white transition-colors">Zen</Link>
          <Link href="#" className="hover:text-white transition-colors">Go</Link>
          <Link href="#" className="hover:text-white transition-colors">Enterprise</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.avatar && (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="hidden text-sm font-medium text-zinc-300 sm:inline font-mono">
                {user.global_name || user.username}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded bg-white px-4 py-1.5 text-[13px] font-medium text-black transition-colors hover:bg-zinc-200 font-mono"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Download
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
