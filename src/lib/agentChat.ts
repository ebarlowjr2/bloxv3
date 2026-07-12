// Direct chat with a specific specialist agent (not BLOX). Routes the message
// to that agent's own relay (DASH → dash-relay, CYRA → cyra-relay) using the
// same task contract, waits for the result, and returns the reply text.
//
// Note: the specialist relays run one-shot tasks (codex exec / hermes -z), so
// each message is handled independently — there is no cross-message memory in
// these per-agent chats yet (BLOX keeps the continuous session).
import { AGENTS, agentBaseUrl, agentBearer } from './agents';

const TIMEOUT_MS = 55_000;
const POLL_MS = 4_000;

export async function chatWithAgent(agentKey: string, message: string): Promise<string> {
  const agent = AGENTS.find((a) => a.key.toLowerCase() === agentKey.toLowerCase());
  if (!agent) throw new Error(`Unknown agent "${agentKey}".`);
  if (!agent.live) throw new Error(`${agent.name} isn't online yet — this agent is coming soon.`);

  const base = agentBaseUrl(agent);
  const bearer = agentBearer(agent);
  if (!base || !bearer) {
    throw new Error(`${agent.name} is deployed but not yet connected to the console (missing relay URL or access key).`);
  }

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` };

  // Start the task.
  const startRes = await fetch(`${base}/task`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ task: message }),
    signal: AbortSignal.timeout(10_000),
  });
  const started = await startRes.json().catch(() => null);
  if (!startRes.ok || !started?.ok || !started.id) {
    throw new Error(started?.error || `${agent.name} could not accept the task (HTTP ${startRes.status}).`);
  }

  // Poll until done/failed or we run out of budget.
  const deadline = Date.now() + TIMEOUT_MS;
  for (;;) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    let info: { status?: string; reply?: string; error?: string } | null = null;
    try {
      const res = await fetch(`${base}/task/${encodeURIComponent(started.id)}`, {
        headers,
        signal: AbortSignal.timeout(10_000),
      });
      info = await res.json().catch(() => null);
    } catch {
      // transient; keep polling until deadline
    }

    if (info?.status === 'done') return info.reply?.trim() || `${agent.name} finished the task.`;
    if (info?.status === 'failed') throw new Error(info.error || `${agent.name} could not complete the task.`);
    if (Date.now() >= deadline) {
      return `${agent.name} is still working on that — it's taking a bit longer than usual. Try again in a moment.`;
    }
  }
}
