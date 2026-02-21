'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Mail, MessageSquare, CheckSquare, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface ToolInvocation {
  id: string;
  tenant_id: string;
  agent_name: string;
  tool_key: string;
  payload: {
    to?: string;
    subject?: string;
    title?: string;
    description?: string;
  };
  result: {
    status?: string;
  };
  run_id: string | null;
  created_at: string;
}

const toolIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  task: <CheckSquare className="w-4 h-4" />,
};

const agentColors: Record<string, string> = {
  'BLOX': 'bg-blue-500',
  'M.A.R.K': 'bg-indigo-500',
  'M.A.R.K.': 'bg-indigo-500',
  'C.O.R.Y': 'bg-purple-500',
  'C.O.R.Y.': 'bg-purple-500',
  'H.A.L.I': 'bg-orange-500',
  'H.A.L.I.': 'bg-orange-500',
  'A.L.E.X': 'bg-green-500',
  'A.L.E.X.': 'bg-green-500',
  'F.I.N.T': 'bg-emerald-500',
  'F.I.N.T.': 'bg-emerald-500',
  'C.Y.R.A': 'bg-red-500',
  'C.Y.R.A.': 'bg-red-500',
  'T.O.N.Y': 'bg-cyan-500',
  'T.O.N.Y.': 'bg-cyan-500',
  'S.A.G.E': 'bg-pink-500',
  'S.A.G.E.': 'bg-pink-500',
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function generateDescription(invocation: ToolInvocation): string {
  const { tool_key, payload, result } = invocation;
  const status = result.status ?? '';
  
  switch (tool_key) {
    case 'email':
      if (status === 'sent') {
        return `Email sent to ${payload.to}: "${payload.subject}"`;
      }
      return `Email to ${payload.to} failed`;
    case 'sms':
      if (status === 'sent') {
        return `SMS sent to ${payload.to}`;
      }
      return `SMS to ${payload.to} failed`;
    case 'task':
      return `Task created: "${payload.title || payload.description}"`;
    default:
      return `Used ${tool_key} tool`;
  }
}

export default function ActivityPage() {
  const [invocations, setInvocations] = useState<ToolInvocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvocations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tools/invocations?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setInvocations(data.invocations);
      } else {
        setError(data.error?.message || 'Failed to load activity');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvocations();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600">See what your AI agents have been doing</p>
        </div>
        <button
          onClick={fetchInvocations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {loading && invocations.length === 0 ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Loading activity...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={fetchInvocations}
              className="mt-4 text-blue-500 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : invocations.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-8 h-8 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No activity yet</p>
            <p className="text-sm text-gray-400">
              When your AI agents use tools like email or SMS, their activity will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {invocations.map((invocation) => {
              const isSuccess = invocation.result.status === 'sent';
              const agentColor = agentColors[invocation.agent_name] || 'bg-gray-500';
              
              return (
                <div
                  key={invocation.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${agentColor} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                      {invocation.agent_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {invocation.agent_name}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                          isSuccess 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {toolIcons[invocation.tool_key] || <CheckSquare className="w-3 h-3" />}
                          {invocation.tool_key}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-600 truncate">
                        {generateDescription(invocation)}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatTimeAgo(invocation.created_at)}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
