import { NextResponse } from 'next/server';
import { AGENTS, CORE_SERVICES, agentBaseUrl } from '@/lib/agents';
import { checkHealth, fetchTasks } from '@/lib/agentHealth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const liveAgents = AGENTS.filter((a) => a.live);

    // Core services (BLOX/DASH/CYRA) drive system health.
    const coreHealth = await Promise.all(
      CORE_SERVICES.map((s) => checkHealth(agentBaseUrl(s))),
    );
    const coreOnline = coreHealth.filter((h) => h.online).length;
    const systemHealth = CORE_SERVICES.length
      ? Math.round((coreOnline / CORE_SERVICES.length) * 100)
      : 0;
    const latencies = coreHealth.map((h) => h.latencyMs).filter((n): n is number => n != null);
    const avgLatency = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

    // Agent-card online count + real task signals.
    const agentHealth = await Promise.all(liveAgents.map((a) => checkHealth(agentBaseUrl(a))));
    const agentsOnline = agentHealth.filter((h) => h.online).length;

    const allTasks = (await Promise.all(liveAgents.map((a) => fetchTasks(a)))).flat();
    const running = allTasks.filter((t) => t.status === 'running').length;
    const failed = allTasks.filter((t) => t.status === 'failed').length;
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const lastHour = allTasks.filter((t) => t.startedAt && Date.parse(t.startedAt) >= hourAgo).length;

    const toolsConnected = liveAgents
      .filter((a, i) => agentHealth[i].online)
      .reduce((sum, a) => sum + a.tools.length, 0);

    const kpis = {
      agentsOnline,
      toolsConnected,
      systemHealth,
      tasksInQueue: running,
    };

    const healthSignals = {
      // Real incidents: failed tasks recently + any core service down.
      incidents: failed + (CORE_SERVICES.length - coreOnline),
      latency: avgLatency != null ? `${avgLatency}ms` : '—',
      integrations: toolsConnected,
      throughput: `${lastHour}/hr`,
    };

    const systemStatus = {
      // "uptime" here = share of core services currently up (no fabricated history).
      uptime: systemHealth.toFixed(2),
      apiServer: coreHealth[0]?.online ? 'online' : 'offline', // BLOX
      database: 'connected',
      smsService: coreHealth[1]?.online ? 'active' : 'offline', // DASH
      aiEngine: coreHealth[2]?.online ? 'ready' : 'offline', // CYRA
    };

    return NextResponse.json({
      success: true,
      data: { kpis, healthSignals, systemStatus, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
