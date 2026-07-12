import { NextResponse } from 'next/server';
import { AGENTS, agentBaseUrl } from '@/lib/agents';
import { checkHealth, fetchTasks, relativeTime } from '@/lib/agentHealth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const agents = await Promise.all(
      AGENTS.map(async (a) => {
        if (!a.live) {
          return {
            key: a.key,
            name: a.name,
            subtitle: a.subtitle,
            color: a.color,
            status: 'offline' as const,
            tools: a.tools,
            lastActivity: 'not deployed',
            tasksCompleted: 0,
          };
        }

        const [health, tasks] = await Promise.all([
          checkHealth(agentBaseUrl(a)),
          fetchTasks(a),
        ]);

        const completed = tasks.filter((t) => t.status === 'done').length;
        const latest = tasks[0];

        return {
          key: a.key,
          name: a.name,
          subtitle: a.subtitle,
          color: a.color,
          status: health.online ? ('online' as const) : ('offline' as const),
          tools: a.tools,
          lastActivity: latest ? relativeTime(latest.startedAt) : health.online ? 'idle' : 'offline',
          tasksCompleted: completed,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: { agents, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agent data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
