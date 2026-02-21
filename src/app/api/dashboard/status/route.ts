import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const kpis = {
      agentsOnline: Math.floor(Math.random() * 3) + 5,
      toolsConnected: Math.floor(Math.random() * 5) + 27,
      systemHealth: Math.floor(Math.random() * 5) + 95,
      tasksInQueue: Math.floor(Math.random() * 10) + 10,
    };

    const healthSignals = {
      incidents: Math.floor(Math.random() * 3),
      latency: `${Math.floor(Math.random() * 50) + 80}ms`,
      integrations: kpis.toolsConnected,
      throughput: `${(Math.random() * 2 + 2).toFixed(1)}k/min`,
    };

    const systemStatus = {
      uptime: (99.9 + Math.random() * 0.09).toFixed(2),
      apiServer: 'online',
      database: 'connected',
      smsService: 'active',
      aiEngine: 'ready',
    };

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        healthSignals,
        systemStatus,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Dashboard status API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
