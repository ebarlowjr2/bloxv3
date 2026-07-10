# BLOX v3

BLOX is a Next.js-based AI agent console with a web chat UI, dashboard shell, agent views, settings, and integration management.

## Current Chat Architecture

The chat UI lives at:
- `src/app/(app)/app/chat/page.tsx`

The server adapter lives at:
- `src/app/api/crew/run/route.ts`

The OpenClaw relay client lives at:
- `src/lib/openclawBridge.ts`

### Request Flow

```
/app/chat -> /api/crew/run -> Lightsail relay (blox-openclaw-relay) -> openclaw CLI -> blox agent
```

The chat page sends:
- `message`
- `channel`
- `workstreamId`
- `role`
- `companyProfile`

Messages from the main BLOX chat go to the live OpenClaw agent running on the
Lightsail host. The relay (from the
[blox-openclaw-bridge](https://github.com/ebarlowjr2/blox-openclaw-bridge)
repo, `relay/server.mjs`) runs on that host behind Apache with TLS and invokes
the `openclaw` CLI against a dedicated `blox` agent. Session keys are
namespaced `blox:web:<workstreamId>` so each workstream keeps its own agent
session, and web traffic can never reach the main agent lane.

Sub-agent chats (`/app/agents/<agent>`, which send an `agent` key) still
return mocked replies until those agents are wired up.

### Environment variables

- `BYPASS_AUTH=true` — required while the UI shell has no real login
- `BLOX_RELAY_URL` — base URL of the relay, e.g. `https://<lightsail-ip>/blox-relay`
- `BLOX_RELAY_BEARER` — bearer token the relay was configured with

Set these in Vercel (Production + Preview) and in `.env.local` for local dev.

### Timeouts

New OpenClaw sessions can take ~50s to answer their first message. The API
route sets `maxDuration = 60` and the relay client aborts at 55s with a
friendly "try again" error, so a slow first reply may require a resend.

## Getting Started

```bash
npm install
npm run dev
```

Then open:
- `http://localhost:3000/app/chat`

If `BYPASS_AUTH=true`, the UI shell APIs will respond without login while prototyping.
