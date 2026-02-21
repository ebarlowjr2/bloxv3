/* eslint-disable react/no-unescaped-entities */
'use client';

import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export const metadata = {
  title: 'Settings - BLOX AI CEO',
  description: 'BLOX settings and preferences',
};

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
};

export default function SettingsPage() {
  const storageKey = 'blox_company_profile';
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);
  const [savedAt, setSavedAt] = useState<string | null>(null);

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
