import { NextRequest, NextResponse } from 'next/server';

interface ToolInvocationRecord {
  id: string;
  tenant_id: string;
  agent_name: string;
  tool_key: string;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  run_id: string | null;
  created_at: string;
}

interface InvocationsResponse {
  success: boolean;
  invocations?: ToolInvocationRecord[];
  error?: {
    code: string;
    message: string;
  };
}

const fallbackInvocations: ToolInvocationRecord[] = [
  {
    id: 'inv-1',
    tenant_id: 'blox-ui',
    agent_name: 'M.A.R.K.',
    tool_key: 'email',
    payload: { to: 'lead@company.com', subject: 'Q1 Outreach' },
    result: { status: 'sent' },
    run_id: 'run-1',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'inv-2',
    tenant_id: 'blox-ui',
    agent_name: 'C.Y.R.A.',
    tool_key: 'task',
    payload: { title: 'Security review' },
    result: { status: 'sent' },
    run_id: 'run-2',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'inv-3',
    tenant_id: 'blox-ui',
    agent_name: 'A.L.E.X.',
    tool_key: 'sms',
    payload: { to: '+1 (555) 555-0123' },
    result: { status: 'sent' },
    run_id: 'run-3',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: NextRequest): Promise<NextResponse<InvocationsResponse>> {
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

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') || '20');

  return NextResponse.json({
    success: true,
    invocations: fallbackInvocations.slice(0, limit),
  });
}
