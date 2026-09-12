export const site = {
  name: "Movie Mate",
  tagline: "Watch together, perfectly in sync",
  description:
    "Create a room, share the link and watch YouTube, Vimeo or any video together in perfect sync. Host-controlled playback, live chat, no sign-up.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_US",
  themeColor: "#1d4ed8",
  backgroundColor: "#ffffff",
  keywords: [
    "watch party",
    "watch together",
    "synced video",
    "movie night online",
    "watch youtube together",
    "video sync room",
    "group watch",
    "co-watching",
  ],
} as const;
