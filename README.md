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
/app/chat -> /api/crew/run -> Lightsail relay (blox-openclaw-relay) -> openclaw CLI -> main agent
```

The chat page sends:
- `message`
- `channel`
- `workstreamId`
- `role`
- `companyProfile`

Messages from the main BLOX chat go into the **main agent's primary session**
(`agent:main:main`) — the same conversation the user has with the agent on
Telegram, so both channels form one continuous thread with shared context and
memory. The relay (from the
[blox-openclaw-bridge](https://github.com/ebarlowjr2/blox-openclaw-bridge)
repo, `relay/server.mjs`) runs on the Lightsail host behind Apache with TLS;
its `/main` lane is guarded by a dedicated `MAIN_RELAY_BEARER` secret, and its
`/relay` lane (isolated `blox` agent, `blox:`-namespaced sessions) remains for
future sub-agents. The console itself is protected by a password login
(`APP_PASSWORD` + signed session cookie).

Sub-agent chats (`/app/agents/<agent>`, which send an `agent` key) still
return mocked replies until those agents are wired up.

### Environment variables

- `APP_PASSWORD` — console login password
- `AUTH_SECRET` — long random string used to sign session cookies
- `BLOX_RELAY_URL` — base URL of the relay, e.g. `https://<lightsail-ip>/blox-relay`
- `MAIN_RELAY_BEARER` — bearer for the relay's `/main` lane (main agent, shared Telegram session)
- `BLOX_RELAY_BEARER` — bearer for the relay's `/relay` lane (isolated `blox` agent, kept for sub-agents)
- `BYPASS_AUTH=true` — local-dev only escape hatch that skips the login gate

Set these in Vercel (Production + Preview) and in `.env.local` for local dev.
Remove `BYPASS_AUTH` from Vercel once `APP_PASSWORD`/`AUTH_SECRET` are set.

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
