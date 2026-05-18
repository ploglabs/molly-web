# molly-web

Discord-authenticated web dashboard for the molly bot. Built with Next.js, Convex, and Tailwind CSS.

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Create a Discord application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application (this serves as both your OAuth2 app and bot)
3. Go to **OAuth2** → add redirect: `http://localhost:3000/api/auth/callback`
4. Go to **Bot** → configure your bot if needed

### 3. Set up Convex

```bash
npx convex dev
```

This creates a Convex deployment and outputs `NEXT_PUBLIC_CONVEX_URL`. Paste it into `.env.local`.

### 4. Configure environment variables

Copy the example and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `DISCORD_CLIENT_ID` | Discord Developer Portal → OAuth2 → Client ID |
| `DISCORD_CLIENT_SECRET` | Discord Developer Portal → OAuth2 → Client Secret |
| `DISCORD_REDIRECT_URI` | `http://localhost:3000/api/auth/callback` |
| `NEXT_PUBLIC_DISCORD_CLIENT_ID` | Same as `DISCORD_CLIENT_ID` (used for bot invite links) |
| `JWT_SECRET` | Run `openssl rand -base64 32` |
| `NEXT_PUBLIC_CONVEX_URL` | Output from `npx convex dev` |

### 5. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Push Convex schema (after code changes)

```bash
npx convex dev --once
```

## Deploy

```bash
npx convex deploy   # deploy Convex functions
```

Then deploy the Next.js app to Vercel or any platform that supports Next.js.
