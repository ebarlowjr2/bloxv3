'use client';

import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, KanbanSquare } from 'lucide-react';

// Public URL of the self-hosted Plane instance. Overridable via the company
// profile (planeUrl) since the box IP can change; defaults to the current one.
const DEFAULT_PLANE_URL = 'https://18.220.74.202';

function readPlaneUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_PLANE_URL;
  try {
    const stored = window.localStorage.getItem('blox_company_profile');
    const url = stored ? (JSON.parse(stored) as { planeUrl?: string }).planeUrl : '';
    return (url && url.trim()) || DEFAULT_PLANE_URL;
  } catch {
    return DEFAULT_PLANE_URL;
  }
}

export default function ProjectsPage() {
  const [planeUrl] = useState<string>(() => readPlaneUrl());
  const embedUrl = useMemo(() => planeUrl.replace(/\/$/, ''), [planeUrl]);

  return (
    <Layout>
      <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Workspace</div>
            <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
            <p className="text-sm text-slate-500">
              Your company&apos;s project boards and per-project docs, powered by Plane.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <a href={embedUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> Open in new tab
            </a>
          </Button>
        </div>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden flex-1 min-h-0">
          <CardContent className="p-0 h-full">
            {embedUrl ? (
              <iframe title="Plane Projects" src={embedUrl} className="h-full w-full border-0" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="size-12 rounded-2xl bg-slate-100 grid place-content-center">
                  <KanbanSquare className="size-6 text-slate-700" />
                </div>
                <div className="text-lg font-semibold text-slate-900">No project board connected</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
