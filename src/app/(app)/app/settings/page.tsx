/* eslint-disable react/no-unescaped-entities */
'use client';

import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

type CompanyProfile = {
  companyName: string;
  industry: string;
  description: string;
  services: string;
  idealCustomer: string;
  regions: string;
  compliance: string;
  tone: string;
  glossary: string;
  goals: string;
  openaiApiKey: string;
  sharedAgentKey: boolean;
  agentKeys: {
    mark: string;
    cory: string;
    alex: string;
    hali: string;
    fint: string;
    cyra: string;
    tony: string;
    sage: string;
  };
  agentTools: {
    mark: string[];
    cory: string[];
    alex: string[];
    hali: string[];
    fint: string[];
    cyra: string[];
    tony: string[];
    sage: string[];
  };
  knowledgeDocs: Array<{
    id: string;
    title: string;
    source: string;
    url: string;
    content: string;
  }>;
  dashIdeProvider: string;
  dashIdeUrl: string;
  dashIdeToken: string;
  dashGithubToken: string;
  dashSshKey: string;
};

const defaultProfile: CompanyProfile = {
  companyName: '',
  industry: '',
  description: '',
  services: '',
  idealCustomer: '',
  regions: '',
  compliance: '',
  tone: 'Executive, concise, confident',
  glossary: '',
  goals: '',
  openaiApiKey: '',
  sharedAgentKey: true,
  agentKeys: {
    mark: '',
    cory: '',
    alex: '',
    hali: '',
    fint: '',
    cyra: '',
    tony: '',
    sage: '',
  },
  agentTools: {
    mark: ['email', 'crm', 'campaigns'],
    cory: ['design', 'copy', 'assets'],
    alex: ['ops', 'workflows', 'status'],
    hali: ['people', 'hiring', 'onboarding'],
    fint: ['finance', 'budgets', 'forecast'],
    cyra: ['security', 'incidents', 'alerts'],
    tony: ['devops', 'deploys', 'infra'],
    sage: ['social', 'content', 'community'],
  },
  knowledgeDocs: [],
  dashIdeProvider: 'code-server',
  dashIdeUrl: '',
  dashIdeToken: '',
  dashGithubToken: '',
  dashSshKey: '',
};

export default function SettingsPage() {
  const storageKey = 'blox_company_profile';
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState({
    title: '',
    source: 'Manual',
    url: '',
    content: '',
  });
  const [driveConnected, setDriveConnected] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const saveProfile = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(profile));
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const addDoc = () => {
    if (!newDoc.title.trim() || !newDoc.content.trim()) return;
    const nextDoc = {
      id: `doc-${Date.now()}`,
      title: newDoc.title.trim(),
      source: newDoc.source.trim() || 'Manual',
      url: newDoc.url.trim(),
      content: newDoc.content.trim(),
    };
    const nextProfile = {
      ...profile,
      knowledgeDocs: [nextDoc, ...profile.knowledgeDocs],
    };
    setProfile(nextProfile);
    setNewDoc({ title: '', source: 'Manual', url: '', content: '' });
  };

  const removeDoc = (id: string) => {
    setProfile({
      ...profile,
      knowledgeDocs: profile.knowledgeDocs.filter((doc) => doc.id !== id),
    });
  };

  const toolOptions = [
    { key: 'email', label: 'Email' },
    { key: 'crm', label: 'CRM' },
    { key: 'campaigns', label: 'Campaigns' },
    { key: 'design', label: 'Design' },
    { key: 'copy', label: 'Copy' },
    { key: 'assets', label: 'Assets' },
    { key: 'ops', label: 'Operations' },
    { key: 'workflows', label: 'Workflows' },
    { key: 'status', label: 'Status' },
    { key: 'people', label: 'People' },
    { key: 'hiring', label: 'Hiring' },
    { key: 'onboarding', label: 'Onboarding' },
    { key: 'finance', label: 'Finance' },
    { key: 'budgets', label: 'Budgets' },
    { key: 'forecast', label: 'Forecast' },
    { key: 'security', label: 'Security' },
    { key: 'incidents', label: 'Incidents' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'devops', label: 'DevOps' },
    { key: 'deploys', label: 'Deploys' },
    { key: 'infra', label: 'Infrastructure' },
    { key: 'social', label: 'Social' },
    { key: 'content', label: 'Content' },
    { key: 'community', label: 'Community' },
  ];

  return (
    <Layout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Company Profile</h1>
          <p className="text-sm text-slate-500">
            Share your company context so BLOX and your agents can tailor responses.
          </p>
        </div>

        <Card className="rounded-3xl border-slate-200">
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Company name</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  placeholder="Blox Security Labs"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Industry</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.industry}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  placeholder="MSSP, SaaS, Healthcare..."
                />
              </label>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Company description</span>
              <textarea
                className="min-h-[96px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                placeholder="We provide managed security, compliance automation, and SOC services..."
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Core services</span>
                <textarea
                  className="min-h-[88px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.services}
                  onChange={(e) => setProfile({ ...profile, services: e.target.value })}
                  placeholder="SOC monitoring, incident response, vulnerability management..."
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Ideal customer</span>
                <textarea
                  className="min-h-[88px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.idealCustomer}
                  onChange={(e) => setProfile({ ...profile, idealCustomer: e.target.value })}
                  placeholder="Mid-market healthcare providers and fintech firms..."
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Regions served</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.regions}
                  onChange={(e) => setProfile({ ...profile, regions: e.target.value })}
                  placeholder="North America, EMEA"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Compliance focus</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.compliance}
                  onChange={(e) => setProfile({ ...profile, compliance: e.target.value })}
                  placeholder="SOC2, HIPAA, PCI"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Preferred tone</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.tone}
                  onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Company glossary</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.glossary}
                  onChange={(e) => setProfile({ ...profile, glossary: e.target.value })}
                  placeholder="Key terms, abbreviations, internal names..."
                />
              </label>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">AI goals / success criteria</span>
              <textarea
                className="min-h-[88px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={profile.goals}
                onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                placeholder="Improve response time, automate reports, standardize playbooks..."
              />
            </label>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">D.A.S.H Workspace</h2>
              <p className="text-sm text-slate-500">
                Configure the embedded IDE and credentials for infrastructure tasks.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">IDE provider</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.dashIdeProvider}
                  onChange={(e) => setProfile({ ...profile, dashIdeProvider: e.target.value })}
                  placeholder="code-server, openvscode, theia"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">IDE URL</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={profile.dashIdeUrl}
                  onChange={(e) => setProfile({ ...profile, dashIdeUrl: e.target.value })}
                  placeholder="https://ide.yourdomain.com"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">IDE access token (optional)</span>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={profile.dashIdeToken}
                onChange={(e) => setProfile({ ...profile, dashIdeToken: e.target.value })}
                placeholder="token or password"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">GitHub token (optional)</span>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={profile.dashGithubToken}
                onChange={(e) => setProfile({ ...profile, dashGithubToken: e.target.value })}
                placeholder="ghp_..."
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">SSH private key (optional)</span>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={profile.dashSshKey}
                onChange={(e) => setProfile({ ...profile, dashSshKey: e.target.value })}
                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
              />
            </label>
            <div className="text-xs text-slate-500">
              Keys are stored locally for now and will move to secure storage when multi-tenant SaaS launches.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Agent Tool Permissions</h2>
              <p className="text-sm text-slate-500">
                Choose which tools each agent can use. This will be enforced server-side.
              </p>
            </div>

            {(
              [
                { key: 'mark', name: 'M.A.R.K.' },
                { key: 'cory', name: 'C.O.R.Y.' },
                { key: 'alex', name: 'A.L.E.X.' },
                { key: 'hali', name: 'H.A.L.I.' },
                { key: 'fint', name: 'F.I.N.T.' },
                { key: 'cyra', name: 'C.Y.R.A.' },
                { key: 'tony', name: 'T.O.N.Y.' },
                { key: 'sage', name: 'S.A.G.E.' },
              ] as const
            ).map((agent) => (
              <div key={agent.key} className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">{agent.name}</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {toolOptions.map((tool) => {
                    const selected = profile.agentTools[agent.key].includes(tool.key);
                    return (
                      <label key={tool.key} className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...profile.agentTools[agent.key], tool.key]
                              : profile.agentTools[agent.key].filter((t) => t !== tool.key);
                            setProfile({
                              ...profile,
                              agentTools: { ...profile.agentTools, [agent.key]: next },
                            });
                          }}
                        />
                        {tool.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Company Brain (RAG)</h2>
              <p className="text-sm text-slate-500">
                Add documents that BLOX can reference. We'll keep this flexible for future sources
                (Google Drive, Notion, etc.). For now, paste content manually.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="font-medium text-slate-700">Google Drive</div>
              <div className="text-xs text-slate-500">
                {driveConnected ? 'Connected' : 'Not connected'}
              </div>
              <Button
                variant="outline"
                className="ml-auto h-8 rounded-full border-slate-200 px-3 text-xs"
                onClick={() => setDriveConnected((prev) => !prev)}
              >
                {driveConnected ? 'Disconnect (stub)' : 'Connect (stub)'}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Document title</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  placeholder="Security Playbook"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Source</span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={newDoc.source}
                  onChange={(e) => setNewDoc({ ...newDoc, source: e.target.value })}
                  placeholder="Manual"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Source URL (optional)</span>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newDoc.url}
                onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                placeholder="https://drive.google.com/..."
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Document content</span>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newDoc.content}
                onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                placeholder="Paste the key content BLOX should remember..."
              />
            </label>

            <div className="flex items-center gap-3">
              <Button className="rounded-full" onClick={addDoc}>
                Add document
              </Button>
              <span className="text-xs text-slate-500">
                {profile.knowledgeDocs.length} documents saved
              </span>
            </div>

            <div className="space-y-3">
              {profile.knowledgeDocs.map((doc) => (
                <div key={doc.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{doc.title}</div>
                      <div className="text-xs text-slate-500">
                        {doc.source}{doc.url ? ` • ${doc.url}` : ''}
                      </div>
                    </div>
                    <button className="text-xs text-slate-400 hover:text-slate-600" onClick={() => removeDoc(doc.id)}>
                      Remove
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 line-clamp-3">{doc.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">AI Keys</h2>
              <p className="text-sm text-slate-500">
                Stored locally in your browser for now. We'll move these to Supabase when SaaS launches.
              </p>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">OpenAI API key (shared)</span>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={profile.openaiApiKey}
                onChange={(e) => setProfile({ ...profile, openaiApiKey: e.target.value })}
                placeholder="sk-..."
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={profile.sharedAgentKey}
                onChange={(e) => setProfile({ ...profile, sharedAgentKey: e.target.checked })}
              />
              Use the shared key for all agents
            </label>

            {!profile.sharedAgentKey && (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(profile.agentKeys).map(([key, value]) => (
                  <label key={key} className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">{key.toUpperCase()} key</span>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={value}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          agentKeys: { ...profile.agentKeys, [key]: e.target.value },
                        })
                      }
                      placeholder="sk-..."
                    />
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button className="rounded-full" onClick={saveProfile}>
            Save profile
          </Button>
          {savedAt && <span className="text-xs text-slate-500">Saved at {savedAt}</span>}
        </div>
      </div>
    </Layout>
  );
}
