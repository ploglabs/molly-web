import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://molly.chat";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "molly — terminal-native Discord chat",
    template: "%s | molly",
  },
  description:
    "molly is a terminal-native realtime chat platform for Discord. TUI client, web dashboard, and relay server — built for developers.",
  keywords: ["discord", "terminal", "chat", "tui", "realtime", "developers"],
  authors: [{ name: "ploglabs" }],
  creator: "ploglabs",
  openGraph: {
    type: "website",
    siteName: "molly",
    title: "molly — terminal-native Discord chat",
    description:
      "Realtime Discord chat in your terminal. TUI client, web dashboard, and relay server built for developers.",
    url: baseUrl,
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "molly — terminal-native Discord chat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "molly — terminal-native Discord chat",
    description:
      "Realtime Discord chat in your terminal. TUI client, web dashboard, and relay server built for developers.",
    images: ["/banner.png"],
    creator: "@ploglabs",
  },
  other: {
    "theme-color": "#1a1a1a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[#1a1a1a] text-neutral-200 font-mono">
        <div className="fixed top-3 left-3 z-50 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white shadow">
          BETA
        </div>
        {children}
      </body>
    </html>
  );
}
