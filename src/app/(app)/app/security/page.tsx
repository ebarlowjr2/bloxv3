'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { ShieldAlert, ShieldCheck, RefreshCw, AlertCircle, Clock, Activity } from 'lucide-react';

interface AlertRecord {
  received_at: string;
  alert: {
    level?: number;
    description?: string;
    rule_id?: string;
    groups?: string[];
    srcip?: string;
    srcuser?: string;
    agent?: { name?: string };
    source?: string;
  };
}

interface DigestRecord {
  created_at: string;
  digest: string;
  alert_count: number;
  window_end?: string;
  reviewed_by_cyra?: boolean;
}

interface SecurityData {
  configured: boolean;
  reachable: boolean;
  digests: DigestRecord[];
  alerts: AlertRecord[];
  alertCount: number;
  digestCount: number;
}

function timeAgo(dateString?: string): string {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateString).toLocaleDateString();
}

function levelBadge(level?: number): string {
  if (level === undefined) return 'bg-gray-100 text-gray-600';
  if (level >= 12) return 'bg-red-100 text-red-700';
  if (level >= 10) return 'bg-orange-100 text-orange-700';
  return 'bg-yellow-100 text-yellow-700';
}

export default function SecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/security');
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error || 'Failed to load security data');
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const latest = data?.digests?.[0];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
              Security
            </h1>
            <p className="text-gray-600">
              Suspicious events (Wazuh level ≥ 10) forwarded to C.Y.R.A., with her hourly review.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
            <p className="mt-2 text-red-600">{error}</p>
            <button onClick={fetchData} className="mt-4 text-rose-500 hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-500">Suspicious events queued</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{data?.alertCount ?? '—'}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-500">CYRA reviews</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{data?.digestCount ?? '—'}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-500">Latest review</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {latest ? timeAgo(latest.created_at) : 'none yet'}
                </p>
              </div>
            </div>

            {/* latest CYRA digest */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <h2 className="font-semibold text-gray-900">Latest CYRA digest</h2>
                {latest?.reviewed_by_cyra === false && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    auto-summary (CYRA review unavailable)
                  </span>
                )}
              </div>
              <div className="p-4">
                {loading && !data ? (
                  <div className="text-center py-6">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : latest ? (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">
                      {timeAgo(latest.created_at)} · {latest.alert_count} event
                      {latest.alert_count === 1 ? '' : 's'}
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                      {latest.digest}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <ShieldCheck className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="mt-2">No reviews yet.</p>
                    <p className="text-sm text-gray-400">
                      CYRA reviews new suspicious events hourly; her digest will appear here and on Telegram.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* recent suspicious events */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Recent suspicious events</h2>
              </div>
              {data && data.alerts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {data.alerts.map((a, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <span
                          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge(
                            a.alert.level,
                          )}`}
                        >
                          lvl {a.alert.level ?? '?'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm font-medium truncate">
                            {a.alert.description || 'Alert'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
                            {a.alert.agent?.name && <span>host: {a.alert.agent.name}</span>}
                            {a.alert.srcip && <span>src: {a.alert.srcip}</span>}
                            {a.alert.srcuser && <span>user: {a.alert.srcuser}</span>}
                            {a.alert.rule_id && <span>rule {a.alert.rule_id}</span>}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(a.received_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <ShieldCheck className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="mt-2">No suspicious events in the queue.</p>
                  <p className="text-sm text-gray-400">
                    Wazuh alerts at level ≥ 10 will appear here as they arrive.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
