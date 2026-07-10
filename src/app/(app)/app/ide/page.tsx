'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Loader2, Send, Bot, User, ShieldCheck } from 'lucide-react';

type CompanyProfile = {
  dashIdeUrl?: string;
  dashIdeToken?: string;
  dashIdeProvider?: string;
};

type TaskState = 'running' | 'done' | 'failed';

interface DashEntry {
  id: string;
  task: string;
  status: TaskState;
  reply?: string | null;
  output?: string | null;
  exitCode?: number | null;
}

function readProfile(): CompanyProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem('blox_company_profile');
    return stored ? (JSON.parse(stored) as CompanyProfile) : null;
  } catch {
    return null;
  }
}

export default function IdePage() {
  // Lazy init avoids a setState-in-effect; profile is read once on mount.
  const [profile] = useState<CompanyProfile | null>(() => readProfile());
  const [entries, setEntries] = useState<DashEntry[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pollers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const ideUrl = profile?.dashIdeUrl?.trim();
  const provider = profile?.dashIdeProvider?.trim() || 'code-server';

  const embedUrl = useMemo(() => {
    if (!ideUrl) return '';
    if (profile?.dashIdeToken) {
      const delimiter = ideUrl.includes('?') ? '&' : '?';
      return `${ideUrl}${delimiter}token=${encodeURIComponent(profile.dashIdeToken)}`;
    }
    return ideUrl;
  }, [ideUrl, profile?.dashIdeToken]);

  const stopPolling = useCallback((id: string) => {
    const handle = pollers.current[id];
    if (handle) {
      clearInterval(handle);
      delete pollers.current[id];
    }
  }, []);

  const poll = useCallback(
    (id: string) => {
      stopPolling(id);
      pollers.current[id] = setInterval(async () => {
        try {
          const res = await fetch(`/api/dash?id=${encodeURIComponent(id)}`);
          const data = await res.json();
          if (!res.ok || !data.success) return;
          setEntries((prev) =>
            prev.map((e) =>
              e.id === id
                ? { ...e, status: data.status, reply: data.reply, output: data.output, exitCode: data.exitCode }
                : e,
            ),
          );
          if (data.status === 'done' || data.status === 'failed') stopPolling(id);
        } catch {
          // transient; keep polling
        }
      }, 3000);
    },
    [stopPolling],
  );

  useEffect(() => {
    const active = pollers.current;
    return () => {
      Object.values(active).forEach((h) => clearInterval(h));
    };
  }, []);

  const submitTask = async () => {
    const task = taskInput.trim();
    if (!task || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/dash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEntries((prev) => [{ id: data.id, task, status: 'running' }, ...prev]);
        setTaskInput('');
        poll(data.id);
      } else {
        setEntries((prev) => [
          { id: `err-${Date.now()}`, task, status: 'failed', reply: data.error || 'Failed to start task.' },
          ...prev,
        ]);
      }
    } catch {
      setEntries((prev) => [
        { id: `err-${Date.now()}`, task, status: 'failed', reply: 'Could not reach DASH.' },
        ...prev,
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">D.A.S.H</div>
            <h1 className="text-2xl font-semibold text-slate-900">IDE Workspace</h1>
            <p className="text-sm text-slate-500">
              Delegate a task to DASH and watch it work in the live workspace.
            </p>
          </div>
          {ideUrl && (
            <Button asChild variant="outline" className="rounded-full">
              <a href={ideUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> Open IDE in new tab
              </a>
            </Button>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)] flex-1 min-h-0">
          {/* DASH task panel */}
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm flex flex-col min-h-0">
            <CardContent className="p-4 flex flex-col h-full min-h-0">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="size-8 rounded-xl bg-slate-900 text-white grid place-content-center">
                  <Bot className="size-4" />
                </div>
                <div className="text-sm font-semibold text-slate-900">Delegate to DASH</div>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-4 min-h-0">
                {entries.length === 0 ? (
                  <div className="h-full grid place-content-center text-center text-sm text-slate-400 px-4">
                    Send DASH a coding or DevOps task. It runs in the workspace on the right.
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div key={entry.id} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <User className="size-4 mt-0.5 text-slate-400 shrink-0" />
                        <div className="text-sm text-slate-800">{entry.task}</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Bot className="size-4 mt-0.5 text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <StatusBadge status={entry.status} exitCode={entry.exitCode} />
                          {entry.reply && (
                            <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap break-words">
                              {entry.reply}
                            </div>
                          )}
                          {entry.output && entry.status !== 'done' && (
                            <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-900 p-2 text-[11px] leading-tight text-slate-100">
                              {entry.output.slice(-2000)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-end gap-2">
                  <textarea
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitTask();
                      }
                    }}
                    placeholder="e.g. Clone repo X and add a health check endpoint"
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    disabled={submitting}
                  />
                  <Button
                    onClick={submitTask}
                    disabled={!taskInput.trim() || submitting}
                    className="rounded-xl h-10"
                  >
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live workspace */}
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden min-h-0">
            <CardContent className="p-0 h-full">
              {ideUrl ? (
                <iframe
                  title="D.A.S.H IDE"
                  src={embedUrl}
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8">
                  <div className="size-12 rounded-2xl bg-slate-100 grid place-content-center">
                    <ShieldCheck className="size-6 text-slate-700" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">No workspace connected</div>
                    <p className="text-sm text-slate-500 max-w-sm">
                      Set the DASH IDE URL ({provider}) in Settings to embed the live workspace here.
                      DASH tasks still run — you can watch them in the panel on the left or open the IDE in a new tab.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatusBadge({ status, exitCode }: { status: TaskState; exitCode?: number | null }) {
  const label = status === 'running' ? 'Working…' : status === 'done' ? 'Done' : `Failed${exitCode != null ? ` (exit ${exitCode})` : ''}`;
  const cls =
    status === 'running'
      ? 'bg-amber-100 text-amber-700'
      : status === 'done'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-rose-100 text-rose-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${cls}`}>
      {status === 'running' && <Loader2 className="size-3 animate-spin" />}
      {label}
    </span>
  );
}
