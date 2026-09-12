# Movie Mate

Create a room, share the link, paste a video URL and watch it together — playback stays in sync for everyone, only the host can play/pause/seek, and there's a chat on the side.

```
movie-mate/
├── client/   Next.js 16 + Tailwind 4 (React 19)
└── server/   Express 5 + TypeScript + Socket.IO (MVC)
```

## Run it

Two terminals:

```bash
# 1. API + realtime server  →  http://localhost:4000
cd server
pnpm install
pnpm dev

# 2. Web app  →  http://localhost:3000
cd client
pnpm install
pnpm dev
```

Config lives in `server/.env` (see `.env.example`) and `client/.env.local` (`NEXT_PUBLIC_SERVER_URL`).

## How sync works

- The server keeps one `PlaybackState` per room: `{ videoUrl, isPlaying, currentTime, updatedAt }`.
- The host's player emits `play` / `pause` / `seek` with its current position, plus a `tick` every 2 s while playing.
- Viewers receive `playback:update`, extrapolate the expected position from when they received it, and nudge their player if it has drifted more than 1 s. No clock synchronisation needed.
- Late joiners get a computed snapshot on `room:join` and land at the right spot immediately.
- Viewers get no player controls (and an overlay so embedded players can't be clicked). If the browser blocks autoplay, they see a "Click to start watching" button.
- If the host disconnects, the longest-standing participant is promoted. The original host's `hostKey` (kept in `sessionStorage`) lets them reclaim host on reload.

Supported links: anything `react-player` can play — YouTube, Vimeo, direct `.mp4`/`.webm`, HLS `.m3u8`, and more.

## Server layout

```
server/src
├── index.ts            bootstrap http + socket server
├── app.ts              express app wiring
├── config/env.ts
├── types/              domain types
├── schemas/            zod schemas for every HTTP body/param and socket payload
├── models/             in-memory RoomRepository (swap for Redis/DB later)
├── services/           RoomService — all business rules (host checks, sync math, chat)
├── controllers/        HTTP handlers
├── routes/             express routers
├── sockets/            typed Socket.IO events + handlers
├── middleware/         zod body/params validation, 404 + error handler
└── utils/              AppError, uuid id generation, zod `parse` helper
```

## Tooling

Both projects have Prettier (`pnpm format` / `pnpm format:check`); the client also sorts Tailwind classes via `prettier-plugin-tailwindcss` and disables conflicting ESLint rules with `eslint-config-prettier`.

HTTP: `POST /api/rooms` → `{ roomId, hostKey }`, `GET /api/rooms/:id`, `GET /api/health`.
