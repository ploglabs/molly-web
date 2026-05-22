# molly-web

Discord-authenticated web dashboard for molly. Built with Next.js, Convex, and Tailwind CSS.

## Run locally

### Prerequisites

- [Bun](https://bun.sh) (or npm/yarn)
- A [Discord application](https://discord.com/developers/applications) with OAuth2 redirect set to `http://localhost:3000/api/auth/callback`

### Setup

```bash
git clone https://github.com/ploglabs/molly-web.git
cd molly-web
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DISCORD_CLIENT_ID=           # Discord app → OAuth2 → Client ID
DISCORD_CLIENT_SECRET=       # Discord app → OAuth2 → Client Secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_DISCORD_CLIENT_ID=   # same as DISCORD_CLIENT_ID
JWT_SECRET=                  # run: openssl rand -base64 32
NEXT_PUBLIC_CONVEX_URL=      # from `npx convex dev` output
```

### Run

```bash
bun install
npx convex dev                # starts Convex backend (leave running)
bun dev                       # starts Next.js on http://localhost:3000
```

### Deploy

```bash
npx convex deploy   # deploy Convex functions
```

Deploy the Next.js app to Vercel or any Next.js-compatible platform.

Set `NEXT_PUBLIC_BASE_URL` in production to your deployed URL for OG meta tags.
