import { NextRequest, NextResponse } from 'next/server';
import { getOpenClawSessionMapping, runWithOpenClaw, type CompanyProfile } from '@/lib/openclaw';

interface CrewRunRequest {
  message: string;
  channel?: 'web' | 'email' | 'sms';
  workstreamId?: string;
  agent?: string;
  role?: 'ceo' | 'agent';
  companyProfile?: CompanyProfile;
}

interface ToolUsed {
  agentName: string;
  toolKey: string;
  summary: string;
  invocationId?: string;
}

interface CrewRunResponse {
  success: boolean;
  reply?: string;
  toolsUsed?: ToolUsed[];
  metadata?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<CrewRunResponse>> {
  const bypassAuth = process.env.BYPASS_AUTH === 'true';
  if (!bypassAuth) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Login required. Set BYPASS_AUTH=true to use the UI shell.',
      },
    }, { status: 401 });
  }

  const workstreamId = request.nextUrl.searchParams.get('workstreamId') || undefined;
  const mapping = getOpenClawSessionMapping(workstreamId);

  return NextResponse.json({
    success: true,
    metadata: {
      transport: process.env.OPENCLAW_TRANSPORT || (process.env.OPENCLAW_WEBHOOK_URL ? 'webhook' : 'mock-session'),
      sessionKey: mapping?.sessionKey || null,
      workstreamId: workstreamId || null,
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<CrewRunResponse>> {
  const bypassAuth = process.env.BYPASS_AUTH === 'true';
  if (!bypassAuth) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Login required. Set BYPASS_AUTH=true to use the UI shell.',
      },
    }, { status: 401 });
  }

  const body: CrewRunRequest = await request.json();
  const { message, channel = 'web', workstreamId, agent, role = 'ceo', companyProfile } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Message is required and must be a non-empty string.',
      },
    }, { status: 400 });
  }

  const result = await runWithOpenClaw({
    message: message.trim(),
    channel,
    workstreamId,
    agent,
    role,
    companyProfile,
  });

  if (!result.success) {
    return NextResponse.json({
      success: false,
      error: result.error || {
        code: 'OPENCLAW_BRIDGE_ERROR',
        message: 'The OpenClaw bridge could not complete the request.',
      },
    }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    reply: result.reply,
    toolsUsed: result.toolsUsed,
    metadata: result.metadata,
  });
}
