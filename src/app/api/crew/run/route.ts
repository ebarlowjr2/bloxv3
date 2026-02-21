import { NextRequest, NextResponse } from 'next/server';

interface CrewRunRequest {
  message: string;
  channel?: 'web' | 'email' | 'sms';
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
  error?: {
    code: string;
    message: string;
  };
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
  const { message } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Message is required and must be a non-empty string.',
      },
    }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    reply: `BLOX (UI-only mode): I received: "${message.trim()}"`,
    toolsUsed: [
      { agentName: 'BLOX', toolKey: 'ui', summary: 'Logged the message in UI-only mode.' },
    ],
  });
}
