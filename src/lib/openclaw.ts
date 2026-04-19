interface ToolUsed {
  agentName: string;
  toolKey: string;
  summary: string;
  invocationId?: string;
}

export interface CompanyProfile {
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
}

export interface OpenClawRunRequest {
  message: string;
  channel?: 'web' | 'email' | 'sms';
  workstreamId?: string;
  role?: 'ceo' | 'agent';
  agent?: string;
  companyProfile?: CompanyProfile;
}

export interface OpenClawRunResult {
  success: boolean;
  reply?: string;
  toolsUsed?: ToolUsed[];
  metadata?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}

function buildContextSummary(request: OpenClawRunRequest): string {
  const parts: string[] = [];

  if (request.workstreamId) {
    parts.push(`Workstream: ${request.workstreamId}`);
  }

  if (request.role) {
    parts.push(`Role: ${request.role}`);
  }

  if (request.agent) {
    parts.push(`Requested agent: ${request.agent}`);
  }

  const profile = request.companyProfile;
  if (profile) {
    const profileParts = [
      profile.companyName ? `Company: ${profile.companyName}` : null,
      profile.industry ? `Industry: ${profile.industry}` : null,
      profile.services ? `Services: ${profile.services}` : null,
      profile.idealCustomer ? `ICP: ${profile.idealCustomer}` : null,
      profile.tone ? `Tone: ${profile.tone}` : null,
      profile.goals ? `Goals: ${profile.goals}` : null,
    ].filter(Boolean);

    if (profileParts.length > 0) {
      parts.push(profileParts.join(' | '));
    }

    if (profile.knowledgeDocs?.length) {
      const docs = profile.knowledgeDocs
        .slice(0, 3)
        .map((doc) => `${doc.title}: ${doc.content.slice(0, 240)}`)
        .join('\n');
      parts.push(`Knowledge:\n${docs}`);
    }
  }

  return parts.join('\n');
}

function buildFallbackReply(request: OpenClawRunRequest): OpenClawRunResult {
  const context = buildContextSummary(request);
  const contextBlock = context ? `\n\nContext loaded:\n${context}` : '';

  return {
    success: true,
    reply: [
      'OpenClaw bridge is scaffolded but not yet fully connected to a live web session.',
      `I received your message: "${request.message.trim()}".`,
      'Next step: wire this route to your OpenClaw web session/session-mapping layer so replies come from the real runtime instead of the fallback adapter.',
      contextBlock,
    ].join('\n'),
    toolsUsed: [
      {
        agentName: 'OpenClaw Bridge',
        toolKey: 'adapter',
        summary: 'Handled by scaffold fallback while live session wiring is pending.',
      },
    ],
    metadata: {
      mode: 'fallback',
    },
  };
}

export async function runWithOpenClaw(request: OpenClawRunRequest): Promise<OpenClawRunResult> {
  const endpoint = process.env.OPENCLOW_WEBHOOK_URL || process.env.OPENCLAW_WEBHOOK_URL;
  const bearerToken = process.env.OPENCLAW_WEBHOOK_BEARER;

  if (!endpoint) {
    return buildFallbackReply(request);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      },
      body: JSON.stringify({
        source: 'blox-web',
        ...request,
      }),
    });

    const data = (await response.json().catch(() => null)) as OpenClawRunResult | null;

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'OPENCLAW_UPSTREAM_ERROR',
          message: data?.error?.message || `OpenClaw upstream returned ${response.status}.`,
        },
      };
    }

    if (data?.success && data.reply) {
      return data;
    }

    return {
      success: false,
      error: {
        code: 'INVALID_OPENCLAW_RESPONSE',
        message: 'OpenClaw returned an unexpected response payload.',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'OPENCLAW_CONNECTIVITY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown connectivity error.',
      },
    };
  }
}
