import { getUserById, getSessionToken } from "@/lib/db";
import { getSessionCookie, verifyToken } from "@/lib/auth/session";
import { fetchUserGuilds, hasAdminAccess } from "@/lib/auth/discord";
import { GuildPicker } from "@/components/guild-picker";
import { BotInfo } from "@/components/bot-info";

async function getAdminGuilds(sessionId: string) {
  try {
    const accessToken = await getSessionToken(sessionId);
    if (!accessToken) return [];
    const guilds = await fetchUserGuilds(accessToken);

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

    return guilds
      .filter(hasAdminAccess)
      .filter((g) => !configuredGuildIds.has(g.id))
      .map((g) => ({
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
    <main className="flex flex-1 flex-col items-center justify-start bg-[#050505] min-h-screen pt-20 pb-24 w-full">
      {user ? (
        <div className="flex w-full max-w-md flex-col gap-6 px-6">
          <BotInfo />

          <div className="rounded-none bg-zinc-950/80 p-4 border-2 border-zinc-800">
            <GuildPicker guilds={guilds} clientId={process.env.DISCORD_CLIENT_ID} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center px-6 text-center w-full">
          {/* Badge */}
          <div className="mb-10 inline-flex items-center gap-3 rounded border border-zinc-800 bg-white/[0.02] py-1 pl-1 pr-4 text-[13px] font-mono text-zinc-400">
            <span className="bg-[#ff8a00] px-2 py-0.5 text-xs font-bold text-black uppercase tracking-wider">
              New
            </span>
            <span>
              Desktop app available in beta on macOS, Windows, and Linux.{" "}
              <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors underline decoration-zinc-700 underline-offset-4">
                Download now
              </a>
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-8 max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl font-mono leading-[1.1] uppercase">
            AI SANDBOXES FOR
            <br />
            DEEP RESEARCH AGENTS
          </h1>

          {/* Subheading */}
          <p className="mb-12 max-w-2xl text-[15px] text-zinc-400 font-mono leading-relaxed">
            Open-source, secure environment with real-world tools
            <br />
            for enterprise-grade agents.
          </p>

          <div className="flex gap-4 mb-20">
            <button className="bg-white text-black px-8 py-3.5 text-sm font-bold font-mono hover:bg-zinc-200 transition-colors">
              START FOR FREE
            </button>
            <button className="bg-transparent border border-zinc-800 text-white px-8 py-3.5 text-sm font-bold font-mono hover:bg-zinc-900 transition-colors">
              VIEW DOCS
            </button>
          </div>

          <div className="mb-20 flex flex-col items-center">
            <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-widest mb-6">TRUSTED BY</p>
            <div className="flex items-center gap-8 opacity-60">
              <span className="font-bold text-lg font-sans">Hugging Face</span>
              <span className="font-bold text-lg font-sans">PGA</span>
              <span className="font-bold text-lg font-sans">Gumloop</span>
              <span className="font-bold text-lg font-sans">manus</span>
              <span className="font-bold text-lg font-sans">groq</span>
              <span className="font-bold text-lg font-sans">Lindy</span>
            </div>
          </div>

          {/* Terminal Mock / App screenshot area */}
          <div className="w-full flex justify-center mt-10 px-4">
            <div className="w-full max-w-[1000px] flex gap-4 font-mono text-left">
               {/* Left Panel */}
               <div className="w-[280px] border border-zinc-800 bg-[#0a0a0a] hidden lg:block text-xs text-zinc-400">
                 <div className="border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
                   <div className="flex gap-1">
                     <span className="text-zinc-500">≡x≡</span>
                     <span className="ml-2 font-bold tracking-widest">LLM</span>
                   </div>
                 </div>
                 <div className="p-4 leading-loose h-[300px]">
                   [.921] <span className="text-[#ff8a00]">[.817]</span> [.744] [.733]<br/>
                   [.820] [.070] [.663] <span className="text-[#ff8a00]">[.463]</span><br/>
                   [.061] <span className="text-zinc-600">......</span> [.844] [.824]<br/>
                   [.679] [.744] <span className="text-zinc-600">......</span> <span className="text-[#ff8a00]">[.452]</span><br/>
                   [.034] <span className="text-zinc-600">......</span> [.145] [.145]<br/>
                   <span className="text-[#ff8a00]">[.810]</span> [.844] [.677] [.677]<br/>
                   [.322] [.452] <span className="text-zinc-600">......</span> [.505]<br/>
                   [.061] [.045] <span className="text-[#ff8a00]">[.452]</span> [.265]<br/>
                   <span className="text-zinc-600">......</span> [.305] <span className="text-[#ff8a00]">[.045]</span> [.043]<br/>
                   [.285] <span className="text-zinc-600">......</span> [.027] [.029]<br/>
                 </div>
               </div>

               {/* Main chat area */}
               <div className="flex-1 border border-zinc-800 bg-[#0a0a0a] flex flex-col">
                 <div className="border-b border-zinc-800 px-4 py-2 flex items-center justify-center relative">
                   <div className="absolute left-4 text-zinc-500 text-xs">≡x≡</div>
                   <span className="text-xs font-bold tracking-widest text-zinc-400">E2B SANDBOX</span>
                 </div>
                 <div className="p-8 text-zinc-400 text-xs flex flex-col flex-1 items-center justify-center">
                   <div className="mb-4 tracking-widest uppercase">Running code...</div>
                   
                   {/* Ascii pattern */}
                   <div className="font-mono text-[#ff8a00] leading-none whitespace-pre relative border border-zinc-800 p-12">
                     <div className="absolute top-2 left-2 text-zinc-600">┌</div>
                     <div className="absolute top-2 right-2 text-zinc-600">┐</div>
                     <div className="absolute bottom-2 left-2 text-zinc-600">└</div>
                     <div className="absolute bottom-2 right-2 text-zinc-600">┘</div>
                     <div className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center whitespace-pre leading-tight">
{`    **    
    **    
    **    
          
 ::::   ::::
          
    **    
    **    `}
                     </div>
                     <div className="text-[#ff8a00] text-center whitespace-pre leading-tight relative z-10 opacity-70">
{`   ::   ::
  ::     ::
 ::       ::
            
            
            
 ::       ::
  ::     ::
   ::   ::`}
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Right Sidebar area */}
               <div className="w-[280px] bg-[#0a0a0a] border border-zinc-800 hidden lg:block text-xs text-zinc-400">
                 <div className="border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
                   <div className="flex gap-1">
                     <span className="text-zinc-500">≡x≡</span>
                     <span className="ml-2 font-bold tracking-widest">OUTPUT</span>
                   </div>
                 </div>
                 <div className="p-4 font-mono leading-loose flex flex-col h-[300px]">
                   <div className="flex text-zinc-600 mb-2">
                     <div className="w-6"></div>
                     <div className="flex-1 text-center">A</div>
                     <div className="flex-1 text-center">B</div>
                     <div className="flex-1 text-center">C</div>
                   </div>
                   <div className="flex items-center">
                     <div className="w-6 text-zinc-500">8</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                   </div>
                   <div className="flex items-center">
                     <div className="w-6 text-zinc-500">7</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                     <div className="flex-1 text-center text-[#ff8a00]">@@@@@</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                   </div>
                   <div className="flex items-center">
                     <div className="w-6 text-zinc-500">6</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                     <div className="flex-1 text-center text-[#ff8a00]">@@@@@</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                   </div>
                   <div className="flex items-center">
                     <div className="w-6 text-zinc-500">5</div>
                     <div className="flex-1 text-center text-zinc-400">@@@@@</div>
                     <div className="flex-1 text-center text-[#ff8a00]">@@@@@</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                   </div>
                   <div className="flex items-center">
                     <div className="w-6 text-zinc-500">4</div>
                     <div className="flex-1 text-center text-zinc-400">@@@@@</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                   </div>
                   <div className="flex items-center">
                     <div className="w-6 text-zinc-500">3</div>
                     <div className="flex-1 text-center text-zinc-700">------</div>
                     <div className="flex-1 text-center text-zinc-400">@@@@@</div>
                     <div className="flex-1 text-center text-zinc-400">@@@@@</div>
                   </div>
                   <div className="flex items-center">
                     <div className="w-6 text-zinc-500">2</div>
                     <div className="flex-1 text-center text-zinc-400">@@@@@</div>
                     <div className="flex-1 text-center text-[#ff8a00]">@@@@@</div>
                     <div className="flex-1 text-center text-zinc-400">@@@@@</div>
                   </div>
                   <div className="flex items-center">
                     <div className="w-6 text-zinc-500">1</div>
                     <div className="flex-1 text-center text-zinc-400">@@@@@</div>
                     <div className="flex-1 text-center text-[#ff8a00]">@@@@@</div>
                     <div className="flex-1 text-center text-zinc-400">@@@@@</div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
