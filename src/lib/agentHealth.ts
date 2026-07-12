// Server-side helpers that pull REAL signals from the agent relays:
// - health() → online/offline + measured latency
// - tasks()  → recent task list (for activity, throughput, incidents)
import { AgentDef, agentBaseUrl, agentBearer } from './agents';

const TIMEOUT_MS = 4000;

export interface HealthResult {
  online: boolean;
  latencyMs: number | null;
}

export interface RelayTask {
  id: string;
  status: 'running' | 'done' | 'failed' | string;
  startedAt?: string;
  task?: string;
}

export async function checkHealth(base: string | null): Promise<HealthResult> {
  if (!base) return { online: false, latencyMs: null };
  const t0 = Date.now();
  try {
    const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { online: res.ok, latencyMs: Date.now() - t0 };
  } catch {
    return { online: false, latencyMs: null };
  }
}

export async function fetchTasks(agent: AgentDef): Promise<RelayTask[]> {
  const base = agentBaseUrl(agent);
  const bearer = agentBearer(agent);
  if (!base || !bearer) return [];
  try {
    const res = await fetch(`${base}/tasks`, {
      headers: { Authorization: `Bearer ${bearer}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => null);
    return Array.isArray(data?.tasks) ? (data.tasks as RelayTask[]) : [];
  } catch {
    return [];
  }
}

export function relativeTime(iso?: string): string {
  if (!iso) return '—';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '—';
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
