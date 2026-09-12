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

## Uploading your own videos (Cloudflare R2)

The `/upload` page lets anyone upload a video **directly from the browser to Cloudflare R2** and get a public link to paste into a room. The file never touches the Express server — the server only signs a one-hour presigned `PUT` URL.

Flow: `POST /api/uploads/presign { filename, contentType, size }` → `{ uploadUrl, publicUrl }` → browser `PUT`s the file to `uploadUrl` with progress → paste `publicUrl` in the room.

### Setup

1. Create an R2 bucket (Cloudflare dashboard → R2).
2. Make it public: enable the **r2.dev subdomain** (development only, rate-limited) or connect a **custom domain** (production).
3. Create an API token: R2 → *Manage R2 API Tokens* → *Object Read & Write* scoped to the bucket. Note the Access Key ID / Secret Access Key.
4. Fill in `server/.env`:

   ```
   R2_ACCOUNT_ID=…            # dashboard → R2 → Overview
   R2_ACCESS_KEY_ID=…
   R2_SECRET_ACCESS_KEY=…
   R2_BUCKET=movie-mate
   R2_PUBLIC_BASE_URL=https://pub-xxxxxxxx.r2.dev   # or https://cdn.example.com
   UPLOAD_MAX_BYTES=2147483648                      # optional, default 2 GB
   ```

5. **Set the bucket's CORS rule** — browser uploads fail without it. In the dashboard go to *Bucket → Settings → CORS Policy* and paste (`AllowedHeaders` must list `content-type` explicitly — `*` does not work on R2):

   ```json
   [{ "AllowedOrigins": ["http://localhost:3000"], "AllowedMethods": ["PUT"],
      "AllowedHeaders": ["content-type"], "ExposeHeaders": ["etag"], "MaxAgeSeconds": 3600 }]
   ```

   Add your production origin to `AllowedOrigins` when you deploy.

Notes: a single presigned `PUT` supports objects up to 5 GB. The signature includes the `Content-Type`, so the browser must send exactly the type it asked for (the client handles this). Accepted types: MP4, WebM, MOV, M4V, MKV, OGV, MPEG, AVI — but only MP4/WebM/M4V/OGV play natively in browsers. When the `R2_*` variables are absent, `/upload` shows a "not enabled" notice and the API returns 503.

## Camera & mic

Participants can share their camera and/or microphone with the room and mute either at any time.

- Peer-to-peer WebRTC mesh; the server only relays signaling (`rtc:signal`) between members of the same room and broadcasts each person's `media:state` (audio/video on or off).
- The client hook `use-media-call.ts` uses the "perfect negotiation" pattern, so turning a camera or mic on/off renegotiates safely in both directions.
- "Mute" stops the track and removes it from every peer connection, so the camera light goes off and no media leaves the browser.
- Uses public Google STUN servers. For users behind strict NATs you'll need a TURN server — add it to `ICE_SERVERS` in `use-media-call.ts`.
- `getUserMedia` requires HTTPS (or `localhost`).

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
