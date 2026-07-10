import { NextRequest, NextResponse } from 'next/server';
import { sendToMainAgent } from '@/lib/openclawBridge';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export const maxDuration = 60;

async function isAuthorized(request: NextRequest): Promise<boolean> {
  if (process.env.BYPASS_AUTH === 'true') return true;
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) return false;
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, authSecret);
}

interface CompanyProfile {
  companyName?: string;
  industry?: string;
  description?: string;
  services?: string;
  idealCustomer?: string;
  regions?: string;
  compliance?: string;
  tone?: string;
  glossary?: string;
  goals?: string;
  knowledgeDocs?: Array<{
    id: string;
    title: string;
    source: string;
    url: string;
    content: string;
  }>;
  agentTools?: Record<string, string[]>;
  openaiApiKey?: string;
}

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

export async function POST(request: NextRequest): Promise<NextResponse<CrewRunResponse>> {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Login required.',
      },
    }, { status: 401 });
  }

  const body: CrewRunRequest = await request.json();
  const { message, agent, companyProfile } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Message is required and must be a non-empty string.',
      },
    }, { status: 400 });
  }

  const agentCatalog = {
    mark: { name: 'M.A.R.K.', role: 'Marketing Agent', tools: companyProfile?.agentTools?.mark || ['campaigns', 'email', 'crm'] },
    cory: { name: 'C.O.R.Y.', role: 'Creative Agent', tools: companyProfile?.agentTools?.cory || ['design', 'copy', 'assets'] },
    alex: { name: 'A.L.E.X.', role: 'Operations Agent', tools: companyProfile?.agentTools?.alex || ['ops', 'workflows', 'status'] },
    hali: { name: 'H.A.L.I.', role: 'HR Agent', tools: companyProfile?.agentTools?.hali || ['people', 'hiring', 'onboarding'] },
    fint: { name: 'F.I.N.T.', role: 'Finance Agent', tools: companyProfile?.agentTools?.fint || ['finance', 'budgets', 'forecast'] },
    cyra: { name: 'C.Y.R.A.', role: 'Security Agent', tools: companyProfile?.agentTools?.cyra || ['security', 'incidents', 'alerts'] },
    tony: { name: 'T.O.N.Y.', role: 'DevOps Agent', tools: companyProfile?.agentTools?.tony || ['devops', 'deploys', 'infra'] },
    sage: { name: 'S.A.G.E.', role: 'Social Agent', tools: companyProfile?.agentTools?.sage || ['social', 'content', 'community'] },
  };

  const targetAgent = agent ? agentCatalog[agent as keyof typeof agentCatalog] : undefined;

  // Sub-agent chats stay mocked until those agents exist; everything else is
  // the main BLOX chat and goes to the live OpenClaw agent.
  if (targetAgent) {
    const companyContext = companyProfile
      ? `Company: ${companyProfile.companyName || 'Unknown'} | Industry: ${companyProfile.industry || 'n/a'} | Services: ${companyProfile.services || 'n/a'} | ICP: ${companyProfile.idealCustomer || 'n/a'}`
      : 'Company: not configured';

    const knowledgeContext = companyProfile?.knowledgeDocs?.length
      ? companyProfile.knowledgeDocs
          .slice(0, 3)
          .map((doc) => `Doc: ${doc.title} (${doc.source}) - ${doc.content.slice(0, 400)}`)
          .join('\n')
      : 'No company documents provided.';

    const routedLabel = `${targetAgent.name} (${targetAgent.role})`;
    return NextResponse.json({
      success: true,
      reply: `BLOX (UI-only mode): Routed to ${routedLabel}. ${companyContext}\n\n${knowledgeContext}\n\nUser message: "${message.trim()}"`,
      toolsUsed: [
        {
          agentName: routedLabel,
          toolKey: 'ui',
          summary: `Allowed tools: ${targetAgent.tools.join(', ')}`,
        },
      ],
    });
  }

  // Main chat goes into the main agent's primary session — the same
  // conversation as Telegram, so both channels share one continuous thread.
  try {
    const reply = await sendToMainAgent(message.trim());
    return NextResponse.json({
      success: true,
      reply,
      toolsUsed: [
        {
          agentName: 'BLOX (main agent)',
          toolKey: 'openclaw-main',
          summary: 'Answered by the live main agent — same session as Telegram.',
        },
      ],
      metadata: {
        transport: 'openclaw-relay',
        lane: 'main',
      },
    });
  } catch (err) {
    console.error('OpenClaw bridge error:', err);
    return NextResponse.json({
      success: false,
      error: {
        code: 'BRIDGE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to reach OpenClaw.',
      },
    }, { status: 502 });
  }
}
