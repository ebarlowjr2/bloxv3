// Canonical agent roster for the dashboard. `live` agents are actually
// deployed and get real health/activity pulled from their relays; the rest are
// planned and honestly render as offline until they come online.
//
// Relay base URLs come from env (IPs can change); the defaults are the current
// public relay addresses so the dashboard shows real data even before the env
// vars are set. Bearers are env-only (needed for each agent's /tasks feed).

export interface AgentDef {
  key: string;
  name: string;
  subtitle: string;
  role: string; // short label for compact UI (sidebar)
  color: string;
  live: boolean;
  urlEnv?: string;
  urlDefault?: string;
  bearerEnv?: string;
  tools: string[];
}

// Core infrastructure services whose health drives "system health" (not shown
// as agent cards — BLOX is the CEO/home, not a sub-agent).
export const CORE_SERVICES: { key: string; urlEnv: string; urlDefault: string }[] = [
  { key: 'BLOX', urlEnv: 'BLOX_RELAY_URL', urlDefault: 'https://18.216.186.205/blox-relay' },
  { key: 'DASH', urlEnv: 'DASH_RELAY_URL', urlDefault: 'https://52.15.189.176/dash-api' },
  { key: 'CYRA', urlEnv: 'CYRA_RELAY_URL', urlDefault: 'https://18.220.149.112/cyra-api' },
];

export const AGENTS: AgentDef[] = [
  {
    key: 'DASH',
    name: 'D.A.S.H.',
    subtitle: 'DevOps Automation & System Handler',
    role: 'DevOps',
    color: 'bg-indigo-500',
    live: true,
    urlEnv: 'DASH_RELAY_URL',
    urlDefault: 'https://52.15.189.176/dash-api',
    bearerEnv: 'DASH_RELAY_BEARER',
    tools: ['Codex · gpt-5.4', 'code-server', 'Git', 'Linux shell'],
  },
  {
    key: 'CYRA',
    name: 'C.Y.R.A.',
    subtitle: 'Cybersecurity Response & Analysis',
    role: 'Security',
    color: 'bg-rose-500',
    live: true,
    urlEnv: 'CYRA_RELAY_URL',
    urlDefault: 'https://18.220.149.112/cyra-api',
    bearerEnv: 'CYRA_RELAY_BEARER',
    tools: ['Hermes · gpt-5.4'],
  },
  // Planned agents — not yet deployed. Rendered offline until they come online.
  { key: 'MARK', name: 'M.A.R.K.', subtitle: 'Marketing, Automation, Research & Knowledge', role: 'Marketing', color: 'bg-sky-500', live: false, tools: ['Gmail', 'HubSpot', 'Google Drive'] },
  {
    key: 'CORY',
    name: 'C.O.R.Y.',
    subtitle: 'Creative Output & Rendering Yield',
    role: 'Media',
    color: 'bg-violet-500',
    live: true,
    urlEnv: 'CORY_RELAY_URL',
    urlDefault: 'https://18.220.149.112/cory-api',
    bearerEnv: 'CORY_RELAY_BEARER',
    tools: ['Gemma 3 1B · Ollama', 'Spaceflight News + APOD', 'StarKid blog', 'Facebook', 'X', 'n8n'],
  },
  { key: 'ALEX', name: 'A.L.E.X.', subtitle: 'Administrative Logistics Executive', role: 'Operations', color: 'bg-emerald-500', live: false, tools: ['Google Calendar', 'Slack', 'Notion'] },
  { key: 'HALI', name: 'H.A.L.I.', subtitle: 'Human Assistance & Labor Intelligence', role: 'HR', color: 'bg-orange-500', live: false, tools: ['LinkedIn', 'BambooHR', 'Indeed'] },
  { key: 'FINT', name: 'F.I.N.T.', subtitle: 'Financial Insights & Transactions', role: 'Finance', color: 'bg-green-600', live: false, tools: ['QuickBooks', 'Stripe', 'Excel'] },
  { key: 'SAGE', name: 'S.A.G.E.', subtitle: 'Social Automation & Growth Engine', role: 'Social', color: 'bg-pink-500', live: false, tools: ['Twitter', 'Instagram', 'Buffer'] },
];

export function agentBaseUrl(a: { urlEnv?: string; urlDefault?: string }): string | null {
  if (a.urlEnv && process.env[a.urlEnv]) return process.env[a.urlEnv]!.replace(/\/$/, '');
  if (a.urlDefault) return a.urlDefault.replace(/\/$/, '');
  return null;
}

export function agentBearer(a: { bearerEnv?: string }): string | null {
  return a.bearerEnv && process.env[a.bearerEnv] ? process.env[a.bearerEnv]! : null;
}
