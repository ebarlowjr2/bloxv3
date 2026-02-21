'use client';

import React from 'react';
import Link from 'next/link';
import { useRealTimeData } from '@/hooks/useRealTimeData';

interface Tool {
  name: string;
  icon: string;
  connected: boolean;
}

interface Agent {
  id: string;
  name: string;
  acronym: string;
  description: string;
  online: boolean;
  tools: Tool[];
  color: string;
}

const AgentCard: React.FC<{ agent: Agent; onToggleAgent: (id: string) => void }> = ({ agent, onToggleAgent }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${agent.color} rounded-lg flex items-center justify-center text-white font-bold mr-3`}>
          {agent.acronym.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{agent.acronym}</h3>
          <p className="text-sm text-gray-600">{agent.name}</p>
        </div>
      </div>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${agent.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        <span className={`text-sm ${agent.online ? 'text-green-600' : 'text-gray-500'}`}>
          {agent.online ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
    <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
    <div className="flex flex-wrap gap-2 mb-4">
      {agent.tools.slice(0, 3).map((tool, index) => (
        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
          <span className="mr-1">{tool.icon}</span>
          {tool.name}
        </span>
      ))}
      {agent.tools.length > 3 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
          +{agent.tools.length - 3} more
        </span>
      )}
    </div>
    <button
      onClick={() => onToggleAgent(agent.id)}
      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
        agent.online
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-green-100 text-green-700 hover:bg-green-200'
      }`}
    >
      {agent.online ? 'Pause Agent' : 'Start Agent'}
    </button>
  </div>
);

const AgentDashboard: React.FC = () => {
  const { data: agentsData, loading: agentsLoading } = useRealTimeData<{
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

  const fallbackAgents = [
    {
      id: 'mark',
      name: 'Marketing, Automation, Research & Knowledge',
      acronym: 'M.A.R.K.',
      description: 'Handles marketing campaigns, automation workflows, research tasks, and knowledge management across all business operations.',
      online: true,
      color: 'bg-blue-500',
      tools: [
        { name: 'HubSpot CRM', icon: '🎯', connected: true },
        { name: 'Google Analytics', icon: '📊', connected: true },
        { name: 'Mailchimp', icon: '📧', connected: true },
        { name: 'Research APIs', icon: '🔍', connected: true }
      ]
    },
    {
      id: 'cory',
      name: 'Creative Output & Rendering Yield',
      acronym: 'C.O.R.Y.',
      description: 'Manages creative content generation, design rendering, and optimizes creative output across all media channels.',
      online: true,
      color: 'bg-purple-500',
      tools: [
        { name: 'Adobe Creative', icon: '🎨', connected: true },
        { name: 'Figma', icon: '✏️', connected: true },
        { name: 'Canva', icon: '🖼️', connected: true },
        { name: 'Video Tools', icon: '🎬', connected: true }
      ]
    },
    {
      id: 'alex',
      name: 'Administrative Logistics Executive',
      acronym: 'A.L.E.X.',
      description: 'Oversees administrative tasks, logistics coordination, and executive-level operational management.',
      online: true,
      color: 'bg-green-500',
      tools: [
        { name: 'Google Workspace', icon: '📁', connected: true },
        { name: 'Slack', icon: '💬', connected: true },
        { name: 'Calendly', icon: '📅', connected: true },
        { name: 'DocuSign', icon: '📝', connected: true }
      ]
    },
    {
      id: 'hali',
      name: 'Human Assistance & Labor Intelligence',
      acronym: 'H.A.L.I.',
      description: 'Provides human resources support, labor analytics, and intelligent workforce management solutions.',
      online: false,
      color: 'bg-orange-500',
      tools: [
        { name: 'HR Systems', icon: '👥', connected: false },
        { name: 'Payroll', icon: '💰', connected: true },
        { name: 'Time Tracking', icon: '⏰', connected: true },
        { name: 'Performance', icon: '📈', connected: false }
      ]
    },
    {
      id: 'fint',
      name: 'Financial Insights & Transactions',
      acronym: 'F.I.N.T.',
      description: 'Handles financial analysis, transaction processing, and provides comprehensive financial insights and reporting.',
      online: true,
      color: 'bg-emerald-500',
      tools: [
        { name: 'QuickBooks', icon: '💼', connected: true },
        { name: 'Stripe', icon: '💳', connected: true },
        { name: 'Yahoo Finance', icon: '📊', connected: true },
        { name: 'Banking APIs', icon: '🏦', connected: true }
      ]
    },
    {
      id: 'cyra',
      name: 'Cybersecurity Response & Analysis',
      acronym: 'C.Y.R.A.',
      description: 'Monitors cybersecurity threats, responds to security incidents, and provides comprehensive security analysis.',
      online: true,
      color: 'bg-red-500',
      tools: [
        { name: 'Security Scanner', icon: '🛡️', connected: true },
        { name: 'Firewall', icon: '🔥', connected: true },
        { name: 'Threat Intel', icon: '🕵️', connected: true },
        { name: 'Monitoring', icon: '👁️', connected: true }
      ]
    },
    {
      id: 'tony',
      name: 'Technical Operations & Network Yield',
      acronym: 'T.O.N.Y.',
      description: 'Manages technical infrastructure, network operations, and optimizes system performance and yield.',
      online: true,
      color: 'bg-indigo-500',
      tools: [
        { name: 'AWS Console', icon: '☁️', connected: true },
        { name: 'Docker', icon: '🐳', connected: true },
        { name: 'Kubernetes', icon: '⚙️', connected: true },
        { name: 'Monitoring', icon: '📡', connected: true }
      ]
    },
    {
      id: 'sage',
      name: 'Social Automation & Growth Engine',
      acronym: 'S.A.G.E.',
      description: 'Automates social media management, drives growth strategies, and optimizes social engagement across platforms.',
      online: false,
      color: 'bg-pink-500',
      tools: [
        { name: 'Twitter API', icon: '🐦', connected: false },
        { name: 'LinkedIn', icon: '💼', connected: true },
        { name: 'Instagram', icon: '📸', connected: false },
        { name: 'Analytics', icon: '📊', connected: true }
      ]
    }
  ];

  const agents = agentsData?.agents ? agentsData.agents.map(agent => ({
    id: agent.key.toLowerCase(),
    name: agent.subtitle,
    acronym: agent.name,
    description: agent.subtitle,
    online: agent.status === 'online',
    color: agent.color,
    tools: agent.tools.map(tool => ({ name: tool, icon: '🔧', connected: true }))
  })) : fallbackAgents;

  const handleToggleAgent = (id: string) => {
    console.log('Toggle agent:', id);
  };

  const stats = [
    { label: 'Active Agents', value: agents.filter(a => a.online).length.toString(), icon: '🤖', color: 'bg-green-500' },
    { label: 'Messages Today', value: agentsLoading ? '...' : '24', icon: '💬', color: 'bg-blue-500' },
    { label: 'Tasks Completed', value: agentsLoading ? '...' : '12', icon: '✅', color: 'bg-purple-500' },
    { label: 'System Health', value: agentsLoading ? '...' : '98%', icon: '❤️', color: 'bg-red-500' },
  ];

  const recentActivity = [
    { action: 'M.A.R.K. completed market research', time: '2 minutes ago', status: 'success' },
    { action: 'F.I.N.T. processed stock data for AAPL', time: '5 minutes ago', status: 'success' },
    { action: 'A.L.E.X. scheduled team meeting', time: '8 minutes ago', status: 'success' },
    { action: 'C.Y.R.A. detected security scan', time: '15 minutes ago', status: 'success' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/app/chat" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
              💬
            </div>
            <div>
              <p className="font-medium text-gray-900">Start Chat</p>
              <p className="text-sm text-gray-600">Talk with B.L.O.X</p>
            </div>
          </Link>
          <Link href="/app/integrations" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white mr-3">
              🔗
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Integrations</p>
              <p className="text-sm text-gray-600">Configure tools</p>
            </div>
          </Link>
          <Link href="/app/settings" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white mr-3">
              ⚙️
            </div>
            <div>
              <p className="font-medium text-gray-900">Settings</p>
              <p className="text-sm text-gray-600">System preferences</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-900">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleAgent={handleToggleAgent}
            />
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">API Server</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">Online</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Database</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">SMS Service</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">AI Engine</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
