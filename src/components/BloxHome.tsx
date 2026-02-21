"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, LineChart, Settings2, Zap, ShieldCheck, Users2, Calendar, Mail, Play, Pause, UploadCloud, Search, CheckCircle2, AlertTriangle, Wifi, Wrench, Plus, Sparkles, Github, Cloud, Database, MessageSquare, DollarSign, Image as ImageIcon, Users, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRealTimeData } from "@/hooks/useRealTimeData";

// ------------------------------------------------------------
// BLOX – AI CEO Home Page
// ------------------------------------------------------------

const fallbackKpis = [
  { label: "Agents Online", value: 5, suffix: "/8" },
  { label: "Tools Connected", value: 29 },
  { label: "System Health", value: 98, suffix: "%" },
  { label: "Tasks in Queue", value: 14 },
];

type QuickActionIcon = React.ComponentType<{ className?: string }>;
type AgentStatus = "online" | "offline";

interface Agent {
  key: string;
  name: string;
  subtitle: string;
  color: string;
  status: AgentStatus;
  tools: string[];
}

const fallbackAgents: Agent[] = [
  {
    key: "MARK",
    name: "M.A.R.K.",
    subtitle: "Marketing, Automation, Research & Knowledge",
    color: "bg-sky-500",
    status: "online",
    tools: ["Gmail", "Google Drive", "Google Search", "Twilio SMS", "HubSpot"],
  },
  {
    key: "CORY",
    name: "C.O.R.Y.",
    subtitle: "Creative Output & Rendering Yield",
    color: "bg-violet-500",
    status: "offline",
    tools: ["Canva", "Adobe", "YouTube", "Figma", "Unsplash"],
  },
  {
    key: "ALEX",
    name: "A.L.E.X.",
    subtitle: "Administrative Logistics Executive",
    color: "bg-emerald-500",
    status: "online",
    tools: ["Google Calendar", "Slack", "Notion", "DocuSign", "Zoom"],
  },
  {
    key: "HALI",
    name: "H.A.L.I.",
    subtitle: "Human Assistance & Labor Intelligence",
    color: "bg-orange-500",
    status: "online",
    tools: ["LinkedIn", "BambooHR", "Workday", "Indeed", "Glassdoor"],
  },
  {
    key: "FINT",
    name: "F.I.N.T.",
    subtitle: "Financial Insights & Transactions",
    color: "bg-green-600",
    status: "offline",
    tools: ["QuickBooks", "Stripe", "PayPal", "Excel", "Mint"],
  },
  {
    key: "CYRA",
    name: "C.Y.R.A.",
    subtitle: "Cybersecurity Response & Analysis",
    color: "bg-rose-500",
    status: "online",
    tools: ["LastPass", "Norton", "Cloudflare", "VPN", "Firewall"],
  },
  {
    key: "TONY",
    name: "T.O.N.Y.",
    subtitle: "Technical Operations & Network Yield",
    color: "bg-indigo-500",
    status: "online",
    tools: ["GitHub", "AWS", "Docker", "Jenkins", "Monitoring"],
  },
  {
    key: "SAGE",
    name: "S.A.G.E.",
    subtitle: "Social Automation & Growth Engine",
    color: "bg-pink-500",
    status: "offline",
    tools: ["Twitter", "Instagram", "Facebook", "TikTok", "Buffer"],
  },
];

const fallbackActivity = [
  { id: 1, icon: "Mail", title: "MARK sent 42 outreach emails", time: "2m ago" },
  { id: 2, icon: "ShieldCheck", title: "CYRA closed phishing incident #4821", time: "14m ago" },
  { id: 3, icon: "Calendar", title: "ALEX scheduled Ops sync for Tue 10:00", time: "25m ago" },
  { id: 4, icon: "Github", title: "TONY merged PR #223 (API ratelimiting)", time: "1h ago" },
];

const fallbackHealthSignals = [
  { label: "Incidents", value: 1, icon: AlertTriangle },
  { label: "Latency", value: "112ms", icon: Wifi },
  { label: "Integrations", value: 29, icon: Wrench },
  { label: "Throughput", value: "3.2k/min", icon: Zap },
];

const QuickAction = ({ icon: Icon, label, href }: { icon: QuickActionIcon; label: string; href?: string }) => {
  const buttonContent = (
    <Button variant="secondary" className="gap-2 rounded-xl">
      <Icon className="size-4" /> {label}
    </Button>
  );
  
  return href ? <Link href={href}>{buttonContent}</Link> : buttonContent;
};

const StatusPill = ({ status }: { status: "online" | "offline" }) => (
  <div className="flex items-center gap-2">
    <span className={`inline-block size-2 rounded-full ${status === "online" ? "bg-emerald-500" : "bg-slate-400"}`} />
    <span className="text-xs text-muted-foreground capitalize">{status}</span>
  </div>
);

const AgentCard: React.FC<{
  name: string;
  subtitle: string;
  color: string;
  status: "online" | "offline";
  tools: string[];
}> = ({ name, subtitle, color, status, tools }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <Card className="h-full border-slate-200/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`size-9 ${color} text-white rounded-full grid place-content-center font-semibold`}>
                {name.split(".")[0]}
              </div>
              <div>
                <CardTitle className="text-base leading-tight">{name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              </div>
            </div>
            <StatusPill status={status} />
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            {tools.slice(0, 5).map((t) => (
              <Badge key={t} variant="secondary" className="rounded-lg">{t}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {status === "online" ? (
              <Button size="sm" className="rounded-xl gap-2"><Play className="size-4" /> Start Task</Button>
            ) : (
              <Button size="sm" variant="outline" className="rounded-xl gap-2"><Play className="size-4" /> Wake Agent</Button>
            )}
            <Button size="sm" variant="ghost" className="rounded-xl gap-2"><Pause className="size-4" /> Pause</Button>
            <Button size="sm" variant="ghost" className="rounded-xl gap-2"><Settings2 className="size-4" /> Settings</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function BloxHome() {
  const { data: statusData } = useRealTimeData<{
    kpis: { agentsOnline: number; toolsConnected: number; systemHealth: number; tasksInQueue: number };
    healthSignals: { incidents: number; latency: string; integrations: number; throughput: string };
    systemStatus: { uptime: string; apiServer: string; database: string; smsService: string; aiEngine: string };
  }>({
    endpoint: '/api/dashboard/status',
    interval: 30000,
  });

  const { data: agentsData } = useRealTimeData<{
    agents: Array<{
      key: string;
      name: string;
      subtitle: string;
      color: string;
      status: 'online' | 'offline';
      tools: string[];
      lastActivity: string;
      tasksCompleted: number;
    }>;
  }>({
    endpoint: '/api/dashboard/agents',
    interval: 15000,
  });

  const { data: activityData, loading: activityLoading } = useRealTimeData<{
    recentActivity: Array<{
      id: number;
      title: string;
      time: string;
      icon: string;
      status: string;
      agent: string;
    }>;
  }>({
    endpoint: '/api/dashboard/activity',
    interval: 10000,
  });

  const kpis = statusData?.kpis ? [
    { label: "Agents Online", value: statusData.kpis.agentsOnline, suffix: "/8" },
    { label: "Tools Connected", value: statusData.kpis.toolsConnected },
    { label: "System Health", value: statusData.kpis.systemHealth, suffix: "%" },
    { label: "Tasks in Queue", value: statusData.kpis.tasksInQueue },
  ] : fallbackKpis;

  const agents: Agent[] = agentsData?.agents
    ? agentsData.agents.map((agent) => ({
        ...agent,
        status: agent.status === 'online' ? 'online' : 'offline',
      }))
    : fallbackAgents;

  const healthSignals = statusData?.healthSignals ? [
    { label: "Incidents", value: statusData.healthSignals.incidents, icon: AlertTriangle },
    { label: "Latency", value: statusData.healthSignals.latency, icon: Wifi },
    { label: "Integrations", value: statusData.healthSignals.integrations, icon: Wrench },
    { label: "Throughput", value: statusData.healthSignals.throughput, icon: Zap },
  ] : fallbackHealthSignals;

  const recentActivity = activityData?.recentActivity || fallbackActivity;

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail': return <Mail className="size-4" />;
      case 'ShieldCheck': return <ShieldCheck className="size-4" />;
      case 'Calendar': return <Calendar className="size-4" />;
      case 'Github': return <Github className="size-4" />;
      case 'DollarSign': return <DollarSign className="size-4" />;
      case 'Image': return <ImageIcon className="size-4" />;
      case 'Users': return <Users className="size-4" />;
      case 'Share': return <Share className="size-4" />;
      default: return <Mail className="size-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 grid place-content-center text-white">
              <Brain className="size-5" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground leading-none">Barlow Logic Operations Xecutive</div>
              <h1 className="text-xl font-semibold tracking-tight">B.L.O.X — Your AI CEO</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <QuickAction icon={Search} label="Ask BLOX" href="/app/chat" />
            <QuickAction icon={UploadCloud} label="Upload Brief" />
            <Button className="gap-2 rounded-xl"><Sparkles className="size-4" /> New Initiative</Button>
          </div>
        </div>
      </header>

      {/* Hero / KPIs */}
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-500 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm/6 opacity-90">Control Center</p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">BLOX Agent Command Center</h2>
              <p className="mt-2 text-white/90 max-w-prose">Orchestrate your organization’s agents, tools, and workflows. Launch initiatives, track progress, and let BLOX automate the busywork.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-2xl bg-white/15 px-4 py-3">
                  <div className="text-xs/5 text-white/80">{k.label}</div>
                  <div className="text-2xl font-semibold">{k.value}<span className="text-sm font-medium ml-1">{k.suffix ?? ""}</span></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Grid */}
      <main className="mx-auto max-w-7xl px-4 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-slate-700">Agents</h3>
            <Button variant="outline" className="rounded-xl gap-2"><Plus className="size-4" /> Add Agent</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((a) => (
              <AgentCard key={a.key} name={a.name} subtitle={a.subtitle} color={a.color} status={a.status} tools={a.tools} />
            ))}
          </div>
        </section>

        {/* Right Rail */}
        <aside className="space-y-4">
          {/* System Health */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uptime</span><span>{statusData?.systemStatus?.uptime || '99.95'}%</span>
                </div>
                <Progress value={statusData?.kpis?.systemHealth || 98} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {healthSignals.map((s) => (
                  <div key={s.label} className="flex items-center gap-3 rounded-xl border p-3">
                    <s.icon className="size-4 text-slate-600" />
                    <div>
                      <div className="text-sm font-medium leading-tight">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activityLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
                <Badge variant="secondary" className="rounded-lg">
                  {activityLoading ? 'Updating...' : 'Live'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.length > 0 ? recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-600">
                    {getActivityIcon(a.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm leading-tight">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{a.time}</div>
                  </div>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
              )) : (
                <div className="text-sm text-muted-foreground">No recent activity</div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button className="rounded-xl gap-2" variant="secondary"><LineChart className="size-4" /> Weekly Review</Button>
              <Button className="rounded-xl gap-2" variant="secondary"><Users2 className="size-4" /> Team Update</Button>
              <Button className="rounded-xl gap-2" variant="secondary"><MessageSquare className="size-4" /> Compose Brief</Button>
              <Button className="rounded-xl gap-2" variant="secondary"><Cloud className="size-4" /> Sync Integrations</Button>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} BLOX • AI CEO Control</span>
          <span className="flex items-center gap-2"><Database className="size-4" /> Region: us-east-1 • Build: 1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
