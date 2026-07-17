import { NextRequest, NextResponse } from 'next/server';
import { AGENTS, agentBaseUrl, agentBearer } from '@/lib/agents';
import { isAuthedRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

const CYRA = AGENTS.find((a) => a.key === 'CYRA')!;

async function cyraGet(path: string): Promise<{ [k: string]: unknown } | null> {
  const base = agentBaseUrl(CYRA);
  const bearer = agentBearer(CYRA);
  if (!base || !bearer) return null;
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { Authorization: `Bearer ${bearer}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as { [k: string]: unknown };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthedRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const configured = Boolean(agentBearer(CYRA));
  try {
    const [digestsRes, alertsRes] = await Promise.all([
      cyraGet('/digests?limit=20'),
      cyraGet('/alerts?limit=50'),
    ]);

    const digests = (digestsRes?.digests as unknown[]) ?? [];
    // /alerts returns oldest->newest; show newest first.
    const alerts = ((alertsRes?.alerts as unknown[]) ?? []).slice().reverse();

    return NextResponse.json({
      success: true,
      data: {
        configured,
        reachable: digestsRes !== null || alertsRes !== null,
        digests,
        alerts,
        alertCount: (alertsRes?.count as number) ?? alerts.length,
        digestCount: (digestsRes?.count as number) ?? digests.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch security data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
