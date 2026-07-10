// Talks to the blox-openclaw-relay running on the Lightsail host (see
// https://github.com/ebarlowjr2/blox-openclaw-bridge). The relay invokes the
// `openclaw` CLI against the dedicated `blox` agent; session keys must be
// namespaced `blox:` so web traffic can never reach the main agent lane.
const TIMEOUT_MS = 55_000;

export async function sendToOpenClaw(text: string, sessionKey: string): Promise<string> {
  const relayUrl = process.env.BLOX_RELAY_URL;
  const relayBearer = process.env.BLOX_RELAY_BEARER;

  if (!relayUrl || !relayBearer) {
    throw new Error('OpenClaw relay is not configured (missing BLOX_RELAY_URL/BLOX_RELAY_BEARER).');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${relayUrl.replace(/\/$/, '')}/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${relayBearer}`,
      },
      body: JSON.stringify({ sessionKey, message: text }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || `OpenClaw relay returned ${response.status}`);
    }
    if (typeof data.reply !== 'string') {
      throw new Error('OpenClaw relay returned an unexpected response.');
    }
    return data.reply;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('BLOX is still working on that one — new sessions can take a minute to spin up. Try sending your message again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
