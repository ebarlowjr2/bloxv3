# BLOX v3

BLOX is a Next.js-based AI agent console with a web chat UI, dashboard shell, agent views, settings, and integration management.

## Current Chat Architecture

The chat UI lives at:
- `src/app/(app)/app/chat/page.tsx`

The server adapter lives at:
- `src/app/api/crew/run/route.ts`

The OpenClaw bridge module lives at:
- `src/lib/openclaw.ts`

### Request Flow

`/app/chat` -> `/api/crew/run` -> OpenClaw bridge transport

The chat page sends:
- `message`
- `channel`
- `workstreamId`
- `role`
- `companyProfile`

## OpenClaw Bridge Modes

### 1. Mock session mode
Good for local development.

- controlled by `OPENCLAW_TRANSPORT=mock-session`
- creates an in-memory mapping of:
  - `workstreamId -> sessionKey`
- lets the UI behave like session-aware chat before a live OpenClaw receiver is attached

### 2. Webhook mode
Used for live integration.

- set `OPENCLAW_TRANSPORT=webhook`
- set `OPENCLAW_WEBHOOK_URL`
- optional: `OPENCLAW_WEBHOOK_BEARER`

The webhook receiver should accept a POST body like:

```json
{
  "source": "blox-web",
  "sessionKey": "optional-existing-session",
  "message": "hello",
  "channel": "web",
  "workstreamId": "ws-123",
  "role": "ceo",
  "agent": "alex",
  "companyProfile": {
    "companyName": "Example Co"
  }
}
```

And return:

```json
{
  "success": true,
  "reply": "assistant response",
  "toolsUsed": [
    {
      "agentName": "OpenClaw",
      "toolKey": "session",
      "summary": "handled by live session"
    }
  ],
  "sessionKey": "session-or-thread-id",
  "metadata": {
    "sessionKey": "session-or-thread-id"
  }
}
```

## Environment

Copy `.env.example` to `.env.local` and adjust as needed.

## Getting Started

```bash
npm install
npm run dev
```

Then open:
- `http://localhost:3000/app/chat`

If `BYPASS_AUTH=true`, the UI shell APIs will respond without login while prototyping.
