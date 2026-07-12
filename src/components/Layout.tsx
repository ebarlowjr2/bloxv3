'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  LayoutGrid,
  MessageSquare,
  Activity,
  PlugZap,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useRealTimeData } from '@/hooks/useRealTimeData';

const navItems = [
  { name: 'Dashboard', href: '/app', icon: LayoutGrid },
  { name: 'Chat', href: '/app/chat', icon: MessageSquare },
  { name: 'Activity', href: '/app/activity', icon: Activity },
  { name: 'Integrations', href: '/app/integrations', icon: PlugZap },
  { name: 'IDE', href: '/app/ide', icon: ShieldCheck },
  { name: 'Settings', href: '/app/settings', icon: Settings },
  { name: 'Agent', href: '/app/agent', icon: Bot },
];

interface SidebarAgent {
  key: string;
  name: string;
  role: string;
  status: 'online' | 'offline';
  live: boolean;
}

// Static roster for first paint / loading; live status comes from the API.
const fallbackAgents: SidebarAgent[] = [
  { key: 'DASH', name: 'D.A.S.H.', role: 'DevOps', status: 'offline', live: true },
  { key: 'CYRA', name: 'C.Y.R.A.', role: 'Security', status: 'offline', live: true },
  { key: 'MARK', name: 'M.A.R.K.', role: 'Marketing', status: 'offline', live: false },
  { key: 'CORY', name: 'C.O.R.Y.', role: 'Creative', status: 'offline', live: false },
  { key: 'ALEX', name: 'A.L.E.X.', role: 'Operations', status: 'offline', live: false },
  { key: 'HALI', name: 'H.A.L.I.', role: 'HR', status: 'offline', live: false },
  { key: 'FINT', name: 'F.I.N.T.', role: 'Finance', status: 'offline', live: false },
  { key: 'SAGE', name: 'S.A.G.E.', role: 'Social', status: 'offline', live: false },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { data } = useRealTimeData<{ agents: SidebarAgent[] }>({
    endpoint: '/api/dashboard/agents',
    interval: 15000,
  });
  const agents = data?.agents?.length ? data.agents : fallbackAgents;
  const onlineCount = agents.filter((a) => a.status === 'online').length;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/80 p-5 flex flex-col gap-7">
        <div className="flex items-center gap-3 px-1">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 grid place-content-center shadow-sm shadow-sky-500/30">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">BLOX</h2>
            <p className="text-[11px] text-slate-400">AI CEO Console</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/app' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full transition ${
                    isActive ? 'bg-gradient-to-b from-cyan-400 to-blue-500' : 'bg-transparent'
                  }`}
                />
                <Icon className={`size-4 ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Agents</div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
              {onlineCount} online
            </span>
          </div>
          <div className="space-y-1">
            {agents.map((agent) => {
              const href = `/app/agents/${agent.key.toLowerCase()}`;
              const isActive = pathname === href;
              const online = agent.status === 'online';
              return (
                <Link
                  key={agent.key}
                  href={href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                    isActive ? 'bg-slate-100' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <span className="relative flex size-2.5 items-center justify-center">
                    <span
                      className={`size-2 rounded-full ${
                        online ? 'bg-emerald-500' : agent.live ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                    />
                    {online && (
                      <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-400 opacity-60" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium leading-tight text-slate-700 group-hover:text-slate-900">
                      {agent.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {agent.role}
                      {!agent.live && ' · soon'}
                    </div>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-300 opacity-0 transition group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-white border border-slate-200 grid place-content-center">
              <Bot className="size-4 text-sky-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">B.L.O.X Core</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {onlineCount > 0 ? 'System healthy' : 'Checking…'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
