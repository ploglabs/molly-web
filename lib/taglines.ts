/** Each tagline is one or more lines; rendered with <br /> between lines. */
export const TAGLINES: readonly (readonly string[])[] = [
  [
    "lightweight discord client",
    "for people tired of opening chrome instances to chat",
  ],
  [
    "because discord somehow needs more ram",
    "than your code editor",
  ],
  [
    "terminal-native discord experience",
    "without the bloated desktop app",
  ],
  ["modern chat apps became operating systems", "molly didnt"],
  [
    "discord desktop but",
    "without the lag spikes and fan noise",
  ],
  ["for people who think", "electron apps were a mistake"],
  [
    "fast keyboard-first discord client",
    "without the chromium nonsense",
  ],
  [
    "because chatting with friends",
    "shouldnt max out your cpu",
  ],
  ["discord if performance mattered", "more than animations"],
  [
    "stripped-down discord",
    "for people addicted to fast software",
  ],
  [
    "because your terminal should not feel faster",
    "than your chat app",
  ],
  [
    "minimal discord client",
    "built out of pure hatred for bloated software",
  ],
  [
    "all your discord servers",
    "without the browser pretending to be an app",
  ],
  [
    "finally a discord client",
    "that doesnt feel like a startup dashboard",
  ],
  [
    "lightweight terminal ui for discord",
    "without the modern app garbage",
  ],
  [
    "because sending messages",
    "should not require hardware acceleration",
  ],
  [
    "chat faster",
    "without opening a gaming-themed browser engine",
  ],
  ["discord became bloated", "molly became usable"],
  [
    "a terminal discord client",
    "for people who close apps from activity monitor",
  ],
  ["modern software got slower", "molly goes the opposite direction"],
  [
    "keyboard-first discord",
    "for people who hate touching their mouse",
  ],
  [
    "because discord desktop should not consume",
    "more resources than gta v",
  ],
  [
    "less animations less telemetry less nonsense",
    "more chatting",
  ],
  [
    "discord without the",
    "electron-induced identity crisis",
  ],
  [
    "because nobody asked discord",
    "to become this heavy",
  ],
  [
    "built for terminal users",
    "forced to live in a discord world",
  ],
  [
    "your gpu deserves better",
    "than rendering discord all day",
  ],
  [
    "because opening discord",
    "should not feel like booting a game engine",
  ],
  [
    "fast enough to make",
    "the official discord client embarrassing",
  ],
  [
    "terminal-native communication",
    "for people tired of modern desktop apps",
  ],
] as const;

export function pickRandomTagline(): readonly string[] {
  return TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
}
