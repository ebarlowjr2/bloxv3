import { NextRequest, NextResponse } from 'next/server';
import { AGENTS } from '@/lib/agents';
import { fetchTasks, relativeTime, RelayTask } from '@/lib/agentHealth';
import { isAuthedRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

const ICON_BY_AGENT: Record<string, string> = {
  DASH: 'Github',
  CYRA: 'ShieldCheck',
};

function summarize(task?: string): string {
  if (!task) return 'ran a task';
  const t = task.replace(/\s+/g, ' ').trim();
  return t.length > 60 ? `${t.slice(0, 60)}…` : t;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthedRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const live = AGENTS.filter((a) => a.live);
    const perAgent = await Promise.all(
      live.map(async (a) => {
        const tasks = await fetchTasks(a);
        return tasks.map((t: RelayTask) => ({ agent: a, task: t }));
      }),
    );

    const merged = perAgent.flat().sort((x, y) => {
      const ax = x.task.startedAt ? Date.parse(x.task.startedAt) : 0;
      const ay = y.task.startedAt ? Date.parse(y.task.startedAt) : 0;
      return ay - ax;
    });

    const recentActivity = merged.slice(0, 6).map((m, i) => ({
      id: i + 1,
      title: `${m.agent.name} — ${summarize(m.task.task)}`,
      time: relativeTime(m.task.startedAt),
      icon: ICON_BY_AGENT[m.agent.key] || 'Bot',
      status: m.task.status === 'failed' ? 'error' : m.task.status === 'running' ? 'pending' : 'success',
      agent: m.agent.name,
    }));

    return NextResponse.json({
      success: true,
      data: { recentActivity, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activity data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
