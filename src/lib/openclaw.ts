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

interface SessionMapping {
  workstreamId: string;
  sessionKey: string;
  createdAt: string;
  updatedAt: string;
}

const sessionMappings = new Map<string, SessionMapping>();

function getStorageKey(workstreamId?: string) {
  return workstreamId?.trim() || '__default__';
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

function getSessionMapping(workstreamId?: string): SessionMapping | null {
  const key = getStorageKey(workstreamId);
  return sessionMappings.get(key) || null;
}

function upsertSessionMapping(workstreamId: string | undefined, sessionKey: string): SessionMapping {
  const key = getStorageKey(workstreamId);
  const now = new Date().toISOString();
  const next: SessionMapping = {
    workstreamId: key,
    sessionKey,
    createdAt: sessionMappings.get(key)?.createdAt || now,
    updatedAt: now,
  };
  sessionMappings.set(key, next);
  return next;
}

function buildFallbackReply(request: OpenClawRunRequest): OpenClawRunResult {
  const context = buildContextSummary(request);
  const session = getSessionMapping(request.workstreamId);
  const contextBlock = context ? `\n\nContext loaded:\n${context}` : '';

  return {
    success: true,
    reply: [
      'OpenClaw live transport is not configured yet, so BLOX is running through the bridge fallback.',
      `I received your message: "${request.message.trim()}".`,
      session
        ? `This workstream is mapped to placeholder session ${session.sessionKey}.`
        : 'No live session mapping exists for this workstream yet.',
      'Next step: point OPENCLAW_WEBHOOK_URL at a real OpenClaw-compatible receiver so this route can exchange live messages.',
      contextBlock,
    ].join('\n'),
    toolsUsed: [
      {
        agentName: 'OpenClaw Bridge',
        toolKey: 'adapter',
        summary: 'Handled by fallback adapter while live session transport is pending.',
      },
    ],
    metadata: {
      mode: 'fallback',
      sessionKey: session?.sessionKey || null,
    },
  };
}

async function callWebhookTransport(request: OpenClawRunRequest): Promise<OpenClawRunResult> {
  const endpoint = process.env.OPENCLOW_WEBHOOK_URL || process.env.OPENCLAW_WEBHOOK_URL;
  const bearerToken = process.env.OPENCLAW_WEBHOOK_BEARER;

  if (!endpoint) {
    return buildFallbackReply(request);
  }

  const existingSession = getSessionMapping(request.workstreamId);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      },
      body: JSON.stringify({
        source: 'blox-web',
        sessionKey: existingSession?.sessionKey,
        ...request,
      }),
    });

    const data = (await response.json().catch(() => null)) as (OpenClawRunResult & {
      sessionKey?: string;
      metadata?: Record<string, unknown>;
    }) | null;

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'OPENCLAW_UPSTREAM_ERROR',
          message: data?.error?.message || `OpenClaw upstream returned ${response.status}.`,
        },
      };
    }

    const returnedSessionKey = typeof data?.sessionKey === 'string'
      ? data.sessionKey
      : typeof data?.metadata?.sessionKey === 'string'
      ? String(data.metadata.sessionKey)
      : existingSession?.sessionKey;

    if (returnedSessionKey) {
      upsertSessionMapping(request.workstreamId, returnedSessionKey);
    }

    if (data?.success && data.reply) {
      return {
        ...data,
        metadata: {
          ...(data.metadata || {}),
          transport: 'webhook',
          sessionKey: returnedSessionKey || null,
        },
      };
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

async function callMockSessionTransport(request: OpenClawRunRequest): Promise<OpenClawRunResult> {
  const existingSession = getSessionMapping(request.workstreamId);
  const sessionKey = existingSession?.sessionKey || `blox-${getStorageKey(request.workstreamId)}`;
  upsertSessionMapping(request.workstreamId, sessionKey);

  const context = buildContextSummary(request);
  return {
    success: true,
    reply: [
      'Mock session transport is enabled.',
      `Session ${sessionKey} accepted your message.`,
      `Message: "${request.message.trim()}"`,
      context ? `\nContext loaded:\n${context}` : '',
    ].join('\n'),
    toolsUsed: [
      {
        agentName: 'OpenClaw Session Mock',
        toolKey: 'session',
        summary: 'Workstream mapped through in-memory mock session transport.',
      },
    ],
    metadata: {
      mode: 'mock-session',
      transport: 'mock-session',
      sessionKey,
    },
  };
}

export async function runWithOpenClaw(request: OpenClawRunRequest): Promise<OpenClawRunResult> {
  const transport = process.env.OPENCLAW_TRANSPORT || (process.env.OPENCLAW_WEBHOOK_URL ? 'webhook' : 'mock-session');

  if (transport === 'mock-session') {
    return callMockSessionTransport(request);
  }

  return callWebhookTransport(request);
}

export function getOpenClawSessionMapping(workstreamId?: string): SessionMapping | null {
  return getSessionMapping(workstreamId);
}
