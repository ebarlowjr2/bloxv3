// Client for the dash-relay task API running on the DASH box (dash-1). The
// relay runs Codex in a full-auto workspace sandbox; tasks are asynchronous:
// POST /task returns an id immediately, GET /task/:id polls status.
const TIMEOUT_MS = 20_000;

export interface DashTaskStart {
  id: string;
  status: 'running';
}

export interface DashTaskStatus {
  id: string;
  status: 'running' | 'done' | 'failed';
  exitCode: number | null;
  task?: string;
  reply?: string | null;
  output?: string | null;
  startedAt?: string;
}

function config() {
  const url = process.env.DASH_RELAY_URL;
  const bearer = process.env.DASH_RELAY_BEARER;
  if (!url || !bearer) {
    throw new Error('DASH relay is not configured (missing DASH_RELAY_URL/DASH_RELAY_BEARER).');
  }
  return { base: url.replace(/\/$/, ''), bearer };
}

async function call(path: string, init: RequestInit) {
  const { base, bearer } = config();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || `DASH relay returned ${response.status}`);
    }
    return data;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('DASH relay did not respond in time.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function startDashTask(task: string, cwd?: string): Promise<DashTaskStart> {
  const data = await call('/task', { method: 'POST', body: JSON.stringify({ task, cwd }) });
  return { id: data.id, status: 'running' };
}

export async function getDashTask(id: string): Promise<DashTaskStatus> {
  const data = await call(`/task/${encodeURIComponent(id)}`, { method: 'GET' });
  return {
    id: data.id,
    status: data.status,
    exitCode: data.exitCode ?? null,
    task: data.task,
    reply: data.reply ?? null,
    output: data.output ?? null,
    startedAt: data.startedAt,
  };
}
