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
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/app', icon: LayoutGrid },
  { name: 'Chat', href: '/app/chat', icon: MessageSquare },
  { name: 'Activity', href: '/app/activity', icon: Activity },
  { name: 'Integrations', href: '/app/integrations', icon: PlugZap },
  { name: 'Settings', href: '/app/settings', icon: Settings },
  { name: 'Agent', href: '/app/agent', icon: Bot },
];

const agentItems = [
  { name: 'M.A.R.K.', role: 'Marketing', href: '/app/agent?agent=mark', status: 'online' },
  { name: 'C.O.R.Y.', role: 'Creative', href: '/app/agent?agent=cory', status: 'offline' },
  { name: 'A.L.E.X.', role: 'Operations', href: '/app/agent?agent=alex', status: 'online' },
  { name: 'H.A.L.I.', role: 'HR', href: '/app/agent?agent=hali', status: 'online' },
  { name: 'F.I.N.T.', role: 'Finance', href: '/app/agent?agent=fint', status: 'offline' },
  { name: 'C.Y.R.A.', role: 'Security', href: '/app/agent?agent=cyra', status: 'online' },
  { name: 'T.O.N.Y.', role: 'DevOps', href: '/app/agent?agent=tony', status: 'online' },
  { name: 'S.A.G.E.', role: 'Social', href: '/app/agent?agent=sage', status: 'offline' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white p-6 flex flex-col gap-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 grid place-content-center">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">BLOX</h2>
            <p className="text-xs text-slate-400">AI CEO Console</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/app' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.35)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full ${
                    isActive ? 'bg-gradient-to-b from-cyan-400 to-blue-500' : 'bg-transparent'
                  }`}
                />
                <Icon className="size-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Agents</div>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
              {agentItems.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {agentItems.map((agent) => (
              <Link
                key={agent.name}
                href={agent.href}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      agent.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                  <div>
                    <div className="font-medium leading-tight">{agent.name}</div>
                    <div className="text-[11px] text-slate-500">{agent.role}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">Chat</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-900/70 grid place-content-center">
              <Bot className="size-5 text-cyan-200" />
            </div>
            <div>
              <div className="text-sm font-semibold">B.L.O.X Core</div>
              <div className="text-xs text-cyan-300">System healthy</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
