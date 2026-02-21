import { NextRequest, NextResponse } from 'next/server';

interface CrewRunRequest {
  message: string;
  channel?: 'web' | 'email' | 'sms';
  agent?: string;
  role?: 'ceo' | 'agent';
  companyProfile?: {
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
  };
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
  const { message, agent, role = 'agent', companyProfile } = body;

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

  const routingHints: Array<{ agent: keyof typeof agentCatalog; keywords: string[] }> = [
    { agent: 'mark', keywords: ['marketing', 'campaign', 'email', 'lead', 'pipeline', 'growth'] },
    { agent: 'cory', keywords: ['creative', 'design', 'brand', 'visual', 'copy'] },
    { agent: 'alex', keywords: ['operations', 'process', 'workflow', 'logistics', 'ops'] },
    { agent: 'hali', keywords: ['hr', 'hiring', 'onboarding', 'people', 'recruit'] },
    { agent: 'fint', keywords: ['finance', 'budget', 'forecast', 'pricing', 'revenue'] },
    { agent: 'cyra', keywords: ['security', 'incident', 'risk', 'vulnerability', 'compliance'] },
    { agent: 'tony', keywords: ['devops', 'deploy', 'infra', 'cloud', 'monitoring'] },
    { agent: 'sage', keywords: ['social', 'community', 'content', 'engagement'] },
  ];

  const text = message.toLowerCase();
  let resolvedAgent = agent && agentCatalog[agent as keyof typeof agentCatalog] ? agent : undefined;

  if (!resolvedAgent && role === 'ceo') {
    const llmKey = companyProfile?.openaiApiKey;
    if (llmKey) {
      try {
        const agentOptions = Object.entries(agentCatalog)
          .map(([key, cfg]) => `${key}: ${cfg.role}`)
          .join('\n');
        const routerPrompt = [
          'You are routing a request to the best agent.',
          'Pick ONLY ONE agent key from the list.',
          'If uncertain, choose "alex" for operations.',
          `Agents:\n${agentOptions}`,
          `User: ${message.trim()}`,
          'Respond with only the agent key.',
        ].join('\n');

        const routerResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${llmKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: routerPrompt }],
            temperature: 0,
            max_tokens: 10,
          }),
        });

        if (routerResponse.ok) {
          const routerData = await routerResponse.json();
          const raw = (routerData.choices?.[0]?.message?.content || '').trim().toLowerCase();
          if (raw in agentCatalog) {
            resolvedAgent = raw as keyof typeof agentCatalog;
          }
        }
      } catch (err) {
        console.error('Router LLM error:', err);
      }
    }

    if (!resolvedAgent) {
      const match = routingHints.find((hint) => hint.keywords.some((k) => text.includes(k)));
      resolvedAgent = match?.agent;
    }
  }

  const companyContext = companyProfile
    ? `Company: ${companyProfile.companyName || 'Unknown'} | Industry: ${companyProfile.industry || 'n/a'} | Services: ${companyProfile.services || 'n/a'} | ICP: ${companyProfile.idealCustomer || 'n/a'}`
    : 'Company: not configured';

  const knowledgeContext = companyProfile?.knowledgeDocs?.length
    ? companyProfile.knowledgeDocs
        .slice(0, 3)
        .map((doc) => `Doc: ${doc.title} (${doc.source}) - ${doc.content.slice(0, 400)}`)
        .join('\n')
    : 'No company documents provided.';

  const targetAgent = resolvedAgent ? agentCatalog[resolvedAgent as keyof typeof agentCatalog] : null;
  const routedLabel = targetAgent ? `${targetAgent.name} (${targetAgent.role})` : 'BLOX AI CEO';

  return NextResponse.json({
    success: true,
    reply: `BLOX (UI-only mode): Routed to ${routedLabel}. ${companyContext}\n\n${knowledgeContext}\n\nUser message: "${message.trim()}"`,
    toolsUsed: [
      {
        agentName: routedLabel,
        toolKey: 'ui',
        summary: targetAgent ? `Allowed tools: ${targetAgent.tools.join(', ')}` : 'CEO routed the request.',
      },
    ],
  });
}
