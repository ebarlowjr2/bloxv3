'use client';

import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Sparkles, Paperclip, Mic, Plus, Search, Folder } from 'lucide-react';
import { useParams } from 'next/navigation';

interface ToolUsed {
  agentName: string;
  toolKey: string;
  summary: string;
}

interface ChatHistoryMessage {
  message: string;
  sender: 'user' | 'blox';
  timestamp: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'blox';
  timestamp: Date;
  toolsUsed?: ToolUsed[];
}

type AgentConfig = {
  name: string;
  role: string;
  status: 'online' | 'offline';
  accent: string;
  placeholder: string;
};

const AGENTS: Record<string, AgentConfig> = {
  mark: {
    name: 'M.A.R.K.',
    role: 'Marketing Agent',
    status: 'online',
    accent: 'bg-sky-100 text-sky-700',
    placeholder: 'Draft a campaign brief for Q2 demand gen...'
  },
  cory: {
    name: 'C.O.R.Y.',
    role: 'Creative Agent',
    status: 'offline',
    accent: 'bg-violet-100 text-violet-700',
    placeholder: 'Create a landing page concept with 3 visuals...'
  },
  alex: {
    name: 'A.L.E.X.',
    role: 'Operations Agent',
    status: 'online',
    accent: 'bg-emerald-100 text-emerald-700',
    placeholder: 'Summarize today’s operational blockers...'
  },
  hali: {
    name: 'H.A.L.I.',
    role: 'HR Agent',
    status: 'online',
    accent: 'bg-amber-100 text-amber-700',
    placeholder: 'Draft an onboarding checklist for new hires...'
  },
  fint: {
    name: 'F.I.N.T.',
    role: 'Finance Agent',
    status: 'offline',
    accent: 'bg-emerald-100 text-emerald-700',
    placeholder: 'Provide a cash flow snapshot for this month...'
  },
  cyra: {
    name: 'C.Y.R.A.',
    role: 'Security Agent',
    status: 'online',
    accent: 'bg-rose-100 text-rose-700',
    placeholder: 'Assess current security risks in the pipeline...'
  },
  tony: {
    name: 'T.O.N.Y.',
    role: 'DevOps Agent',
    status: 'online',
    accent: 'bg-indigo-100 text-indigo-700',
    placeholder: 'Summarize deploy status across environments...'
  },
  sage: {
    name: 'S.A.G.E.',
    role: 'Social Agent',
    status: 'offline',
    accent: 'bg-pink-100 text-pink-700',
    placeholder: 'Outline next week’s social content calendar...'
  },
};

export default function AgentChatPage() {
  const params = useParams<{ agent: string }>();
  const agentKey = typeof params.agent === 'string' ? params.agent : '';
  const agent = AGENTS[agentKey];

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/chat');
      const data: { messages?: ChatHistoryMessage[] } = await response.json();
      if (Array.isArray(data.messages)) {
        const formattedMessages = data.messages
          .filter((msg) => msg && typeof msg.message === 'string' && typeof msg.sender === 'string' && typeof msg.timestamp === 'string')
          .map((msg) => ({
            id: `${msg.timestamp}-${msg.sender}`,
            content: msg.message,
            sender: msg.sender as 'user' | 'blox',
            timestamp: new Date(msg.timestamp),
          }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/crew/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content, channel: 'web', agent: agentKey }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const bloxMessage: Message = {
          id: `${Date.now()}-blox`,
          content: data.reply || 'I processed your request.',
          sender: 'blox',
          timestamp: new Date(),
          toolsUsed: data.toolsUsed,
        };
        setMessages(prev => [...prev, bloxMessage]);
      } else {
        const errorMessage: Message = {
          id: `${Date.now()}-error`,
          content: data.error?.message || 'Sorry, I encountered an issue processing your request.',
          sender: 'blox',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        content: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        sender: 'blox',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickStarts = [
    { title: 'Draft a brief', icon: Sparkles, tone: 'bg-amber-100 text-amber-700' },
    { title: 'Review roadmap', icon: Sparkles, tone: 'bg-sky-100 text-sky-700' },
    { title: 'Summarize blockers', icon: Sparkles, tone: 'bg-emerald-100 text-emerald-700' },
    { title: 'Next steps', icon: Sparkles, tone: 'bg-fuchsia-100 text-fuchsia-700' },
  ];

  const projects = [
    { title: 'Current Initiative', note: 'Weekly execution plan' },
    { title: 'Campaign Q2', note: 'Messaging and deliverables' },
    { title: 'Ops Sync', note: 'KPIs and escalations' },
  ];

  if (!agent) {
    return (
      <Layout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Agent not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
              Agent Chat
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{agent.name}</h1>
              <Badge variant="secondary">{agent.role}</Badge>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${agent.accent}`}>
                <span className={`h-2 w-2 rounded-full ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {agent.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 rounded-full border-slate-200">
              <Search className="size-4" /> Search
            </Button>
            <Button className="gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800">
              <Sparkles className="size-4" /> Upgrade
            </Button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex-1 overflow-y-auto p-8">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                  <div className="size-12 rounded-2xl bg-slate-100 text-slate-900 grid place-content-center">
                    <Bot className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold text-slate-900">Welcome to {agent.name}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Start a focused conversation with your {agent.role.toLowerCase()}.
                    </p>
                  </div>
                  <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                    {quickStarts.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.title}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:border-slate-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`size-9 rounded-xl grid place-content-center ${item.tone}`}>
                              <Icon className="size-4" />
                            </div>
                            <span className="font-medium text-slate-800">{item.title}</span>
                          </div>
                          <Plus className="size-4 text-slate-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'blox' && (
                        <div className="size-9 rounded-2xl bg-slate-900 text-white grid place-content-center">
                          <Bot className="size-4" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                          message.sender === 'user'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.toolsUsed && message.toolsUsed.length > 0 && (
                          <div className="mt-3 space-y-1 border-t border-slate-200/70 pt-2 text-xs text-slate-500">
                            {message.toolsUsed.map((tool, idx) => (
                              <p key={idx}>
                                ({tool.agentName} {tool.summary || `used ${tool.toolKey}`})
                              </p>
                            ))}
                          </div>
                        )}
                        <p
                          className={`mt-2 text-xs ${
                            message.sender === 'user' ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {message.sender === 'user' && (
                        <div className="size-9 rounded-2xl bg-slate-200 text-slate-700 grid place-content-center">
                          <User className="size-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="size-9 rounded-2xl bg-slate-900 text-white grid place-content-center">
                        <Bot className="size-4" />
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          {agent.name} is thinking...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={agent.placeholder}
                    className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="h-9 w-9 rounded-full p-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1">
                      <Paperclip className="size-3" /> Attach
                    </button>
                    <button className="flex items-center gap-1">
                      <Mic className="size-3" /> Voice Message
                    </button>
                  </div>
                  <div>20 / 3,000</div>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                BLOX may generate inaccurate information about people, places, or facts.
              </p>
            </div>
          </div>

          <Card className="h-full rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Workstreams</div>
                <span className="text-xs text-slate-400">{projects.length}</span>
              </div>
              <div className="mt-4 space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.title}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-left text-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="size-9 rounded-xl bg-slate-100 grid place-content-center text-slate-600">
                          <Folder className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{project.title}</div>
                          <div className="text-xs text-slate-500">{project.note}</div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">⋯</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
