'use client';

import React, { useMemo, useState } from "react";
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Toggle } from "@/components/ui/toggle";

interface IntegrationItem {
  key: string;
  name: string;
  emoji: string;
  desc: string;
  category: string;
  status: "connected" | "disconnected" | "attention";
  account: string | null;
  lastSync: string | null;
  health: number;
}

function StatusPill({ status }: { status: string }) {
  const map = {
    connected: { dot: "bg-emerald-500", text: "Connected" },
    disconnected: { dot: "bg-slate-400", text: "Disconnected" },
    attention: { dot: "bg-amber-500", text: "Needs attention" },
  };
  const cfg = map[status as keyof typeof map] ?? map.disconnected;
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-2 w-2 rounded-full ${cfg.dot}`} />
      <span className="text-xs text-slate-500">{cfg.text}</span>
    </div>
  );
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "communication", label: "Communication" },
  { key: "storage", label: "Storage" },
  { key: "devops", label: "DevOps" },
  { key: "security", label: "Security" },
  { key: "finance", label: "Finance" },
  { key: "marketing", label: "Marketing" },
  { key: "hr", label: "HR" },
  { key: "social", label: "Social" },
];

const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  { key: "gmail", name: "Gmail", emoji: "✉️", desc: "Send and receive email via BLOX.", category: "communication", status: "connected", account: "blox@barlowholdings.io", lastSync: "2m ago", health: 99 },
  { key: "gcal", name: "Google Calendar", emoji: "📅", desc: "Schedule and read events.", category: "communication", status: "connected", account: "BLOX Primary", lastSync: "5m ago", health: 98 },
  { key: "slack", name: "Slack", emoji: "💬", desc: "Post updates and read channels.", category: "communication", status: "attention", account: "One Circle Workspace", lastSync: "1h ago", health: 72 },
  { key: "gdrive", name: "Google Drive", emoji: "📁", desc: "Search and manage files.", category: "storage", status: "connected", account: "BLOX Shared", lastSync: "1m ago", health: 99 },
  { key: "notion", name: "Notion", emoji: "📚", desc: "Read/write workspace docs.", category: "storage", status: "disconnected", account: null, lastSync: null, health: 0 },
  { key: "github", name: "GitHub", emoji: "🐙", desc: "PRs, issues, releases.", category: "devops", status: "connected", account: "github.com/ebarlowjr2", lastSync: "8m ago", health: 96 },
  { key: "aws", name: "AWS", emoji: "☁️", desc: "Deployments and logs.", category: "devops", status: "connected", account: "prod-us-east-1", lastSync: "12m ago", health: 94 },
  { key: "docker", name: "Docker", emoji: "🐳", desc: "Images and registry.", category: "devops", status: "disconnected", account: null, lastSync: null, health: 0 },
  { key: "sentinelone", name: "SentinelOne", emoji: "🛡️", desc: "Endpoint security ops.", category: "security", status: "connected", account: "One Circle MSSP", lastSync: "3m ago", health: 97 },
  { key: "wazuh", name: "Wazuh", emoji: "🧩", desc: "SIEM & agent telemetry.", category: "security", status: "connected", account: "SOC-LAB", lastSync: "7m ago", health: 93 },
  { key: "cloudflare", name: "Cloudflare", emoji: "🌐", desc: "DNS & WAF automation.", category: "security", status: "attention", account: "onecs.net", lastSync: "2h ago", health: 68 },
  { key: "stripe", name: "Stripe", emoji: "💳", desc: "Payments & billing.", category: "finance", status: "connected", account: "BLOX SaaS", lastSync: "10m ago", health: 98 },
  { key: "quickbooks", name: "QuickBooks", emoji: "📒", desc: "Invoices & ledger.", category: "finance", status: "disconnected", account: null, lastSync: null, health: 0 },
  { key: "paypal", name: "PayPal", emoji: "💰", desc: "Payouts & balances.", category: "finance", status: "disconnected", account: null, lastSync: null, health: 0 },
  { key: "hubspot", name: "HubSpot", emoji: "📣", desc: "CRM & sequences.", category: "marketing", status: "connected", account: "MARK-CRM", lastSync: "4m ago", health: 95 },
  { key: "twilio", name: "Twilio", emoji: "📲", desc: "SMS & voice actions.", category: "marketing", status: "connected", account: "+1 (555) 555-0123", lastSync: "1m ago", health: 99 },
  { key: "meta", name: "Meta Business", emoji: "📱", desc: "Ads & pages.", category: "social", status: "disconnected", account: null, lastSync: null, health: 0 },
  { key: "x", name: "X (Twitter)", emoji: "🐦", desc: "Post & analytics.", category: "social", status: "disconnected", account: null, lastSync: null, health: 0 },
  { key: "bamboohr", name: "BambooHR", emoji: "🧑‍💼", desc: "Directory & PTO.", category: "hr", status: "disconnected", account: null, lastSync: null, health: 0 },
];

function CategoryChips({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          className={`rounded-xl border px-3 py-1.5 text-sm ${
            value === c.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
      <span>🔎</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none placeholder:text-slate-400"
        placeholder="Search integrations"
      />
    </div>
  );
}

function IntegrationCard({ item, onToggle }: { item: IntegrationItem; onToggle: (item: IntegrationItem) => void }) {
  const isConnected = item.status === "connected";
  const needsAttention = item.status === "attention";
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-content-center rounded-xl bg-slate-100 text-lg">{item.emoji}</div>
            <div>
              <div className="text-sm font-semibold">{item.name}</div>
              <div className="mt-0.5 text-xs text-slate-500">{item.desc}</div>
            </div>
          </div>
          <StatusPill status={item.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isConnected ? (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border p-3"><div className="font-medium">Account</div><div className="text-slate-500 mt-0.5">{item.account}</div></div>
            <div className="rounded-xl border p-3"><div className="font-medium">Last sync</div><div className="text-slate-500 mt-0.5">{item.lastSync}</div></div>
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500"><span>Health</span><span>{item.health}%</span></div>
              <Progress value={item.health} />
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500">Not connected — connect to enable BLOX automations.</div>
        )}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <button className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white">Configure</button>
              <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700">Disconnect</button>
              <div className="ml-auto"><Toggle checked={true} onChange={() => onToggle(item)} /></div>
            </>
          ) : (
            <>
              <button className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white">{needsAttention ? "Reconnect" : "Connect"}</button>
              {needsAttention && (
                <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700">View Error</button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HealthWidget() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="text-sm font-semibold">Connection Health</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Overall</span><span>96%</span></div>
          <Progress value={96} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">Errors (24h)</div><div className="text-base font-semibold">3</div></div>
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">Latency (avg)</div><div className="text-base font-semibold">118ms</div></div>
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">Webhooks queued</div><div className="text-base font-semibold">7</div></div>
          <div className="rounded-xl border p-3"><div className="text-xs text-slate-500">APIs rate used</div><div className="text-base font-semibold">62%</div></div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentErrors() {
  const rows = [
    { id: "CF-429", source: "Cloudflare", when: "23m ago", note: "429 rate limited" },
    { id: "SLK-401", source: "Slack", when: "1h ago", note: "Expired token" },
    { id: "GH-500", source: "GitHub", when: "3h ago", note: "Server error on PR sync" },
  ];
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="text-sm font-semibold">Recent Errors</div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="flex items-start gap-3">
            <div className="mt-0.5">⚠️</div>
            <div className="flex-1">
              <div className="text-sm font-medium">{r.source} · <span className="font-normal text-slate-500">{r.id}</span></div>
              <div className="text-xs text-slate-500">{r.when} — {r.note}</div>
            </div>
            <button className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs">Details</button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function IntegrationsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchesQuery = (i.name + " " + i.desc).toLowerCase().includes(query.toLowerCase());
      const matchesCat = category === "all" || i.category === category;
      const matchesStatus = statusFilter === "all" || i.status === statusFilter;
      return matchesQuery && matchesCat && matchesStatus;
    });
  }, [items, query, category, statusFilter]);

  const groups = useMemo(() => {
    return {
      connected: filtered.filter((i) => i.status === "connected"),
      attention: filtered.filter((i) => i.status === "attention"),
      available: filtered.filter((i) => i.status === "disconnected"),
    };
  }, [filtered]);

  function handleToggle(item: IntegrationItem) {
    const next = items.map((v) => (v.key === item.key ? { ...v, health: Math.max(0, v.health + (v.health >= 100 ? -20 : 5)) } : v));
    setItems(next);
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="sticky top-0 z-10 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-content-center rounded-xl bg-gradient-to-br from-indigo-600 to-rose-500 text-white">🔗</div>
              <div>
                <div className="text-xs text-slate-500">BLOX Platform</div>
                <h1 className="text-lg font-semibold tracking-tight">Integrations</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <SearchBox value={query} onChange={setQuery} />
              <button className="rounded-xl bg-slate-900 px-3 py-1.5 text-white">＋ Add Integration</button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 pt-6 pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CategoryChips value={category} onChange={setCategory} />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Status:</span>
              {[
                { key: "all", label: "All" },
                { key: "connected", label: "Connected" },
                { key: "attention", label: "Needs attention" },
                { key: "disconnected", label: "Disconnected" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`rounded-xl border px-3 py-1.5 ${
                    statusFilter === s.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-12 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-slate-700">Connected <span className="text-slate-400">({groups.connected.length})</span></h3>
                <Badge>Auto-sync enabled</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {groups.connected.map((item) => (
                  <IntegrationCard key={item.key} item={item} onToggle={handleToggle} />
                ))}
                {groups.connected.length === 0 && (
                  <Card className="p-6 text-sm text-slate-500">No connected integrations match your filters.</Card>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-slate-700">Needs Attention <span className="text-slate-400">({groups.attention.length})</span></h3>
                <Badge>Action required</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {groups.attention.map((item) => (
                  <IntegrationCard key={item.key} item={item} onToggle={handleToggle} />
                ))}
                {groups.attention.length === 0 && (
                  <Card className="p-6 text-sm text-slate-500">No integrations require attention.</Card>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-slate-700">Available <span className="text-slate-400">({groups.available.length})</span></h3>
                <Badge>Browse and connect</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {groups.available.map((item) => (
                  <IntegrationCard key={item.key} item={item} onToggle={handleToggle} />
                ))}
                {groups.available.length === 0 && (
                  <Card className="p-6 text-sm text-slate-500">All services are connected. Nice!</Card>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <HealthWidget />
            <RecentErrors />
            <Card>
              <CardHeader className="pb-2"><div className="text-sm font-semibold">Webhook Queue</div></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl border p-3"><span>Pending deliveries</span><span className="font-semibold">7</span></div>
                <div className="flex items-center justify-between rounded-xl border p-3"><span>Dead-lettered</span><span className="font-semibold">1</span></div>
                <button className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5">Retry Failed</button>
              </CardContent>
            </Card>
          </aside>
        </main>

        <footer className="border-t border-slate-200/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} BLOX • Integrations</span>
            <span>Region: us-east-1 • Build: 1.0.0</span>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
