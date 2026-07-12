import { NextRequest, NextResponse } from 'next/server';
import { chatWithAgent } from '@/lib/agentChat';
import { isAuthedRequest } from '@/lib/session';

export const maxDuration = 60;

export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isAuthedRequest(request))) {
    return NextResponse.json({ success: false, error: 'Login required.' }, { status: 401 });
  }

  const { key } = await params;
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === 'string' && body.message.trim() ? body.message.trim() : null;
  if (!message) {
    return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
  }

  try {
    const reply = await chatWithAgent(key, message);
    return NextResponse.json({
      success: true,
      reply,
      toolsUsed: [{ agentName: key.toUpperCase(), toolKey: 'agent-relay', summary: 'Answered directly by the live agent.' }],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Agent chat failed.' },
      { status: 502 },
    );
  }
}
