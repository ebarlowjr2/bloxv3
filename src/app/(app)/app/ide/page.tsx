'use client';

import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, ShieldCheck, Terminal, GitBranch } from 'lucide-react';

type CompanyProfile = {
  dashIdeUrl?: string;
  dashIdeToken?: string;
  dashIdeProvider?: string;
};

export default function IdePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('blox_company_profile') : null;
    if (stored) {
      const parsed = JSON.parse(stored) as CompanyProfile;
      setProfile(parsed);
    }
    setLoading(false);
  }, []);

  const ideUrl = profile?.dashIdeUrl?.trim();
  const provider = profile?.dashIdeProvider?.trim() || 'Workspace IDE';

  const embedUrl = useMemo(() => {
    if (!ideUrl) return '';
    if (profile?.dashIdeToken) {
      const delimiter = ideUrl.includes('?') ? '&' : '?';
      return `${ideUrl}${delimiter}token=${encodeURIComponent(profile.dashIdeToken)}`;
    }
    return ideUrl;
  }, [ideUrl, profile?.dashIdeToken]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">D.A.S.H</div>
            <h1 className="text-2xl font-semibold text-slate-900">IDE Workspace</h1>
            <p className="text-sm text-slate-500">
              Launch a secure workspace for D.A.S.H to run terminals, Git, and SSH tasks.
            </p>
          </div>
          {ideUrl && (
            <Button asChild className="rounded-full">
              <a href={ideUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> Open in new tab
              </a>
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="min-h-[560px] rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4 h-full">
              {loading ? (
                <div className="h-full grid place-content-center text-sm text-slate-400">Loading workspace…</div>
              ) : ideUrl ? (
                <iframe
                  title="D.A.S.H IDE"
                  src={embedUrl}
                  className="h-full w-full rounded-2xl border border-slate-200"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <div className="size-12 rounded-2xl bg-slate-100 grid place-content-center">
                    <ShieldCheck className="size-6 text-slate-700" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">No workspace connected</div>
                    <p className="text-sm text-slate-500">
                      Configure your IDE endpoint in Settings to embed the workspace here.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="text-sm font-semibold text-slate-900">Workspace Details</div>
                <div className="text-xs text-slate-500">Provider</div>
                <div className="text-sm text-slate-700">{provider}</div>
                <div className="text-xs text-slate-500">Endpoint</div>
                <div className="text-sm text-slate-700 break-all">{ideUrl || 'Not configured'}</div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="text-sm font-semibold text-slate-900">Capabilities</div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Terminal className="size-4" /> Terminal + SSH
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <GitBranch className="size-4" /> Git + GitHub
                </div>
                <div className="text-xs text-slate-500">
                  D.A.S.H will operate inside this environment once keys are configured.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
