'use client';

import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2 } from 'lucide-react';

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

export default function ChatPage() {
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
        body: JSON.stringify({ message: userMessage.content, channel: 'web' }),
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

  return (
    <Layout>
      <div className="h-full flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Chat with B.L.O.X.</h1>
            <Badge variant="secondary" className="ml-2">
              AI CEO
            </Badge>
          </div>
          <p className="text-gray-600">
            Communicate directly with B.L.O.X. (Barlow Logic Operations Xecutive), your AI CEO assistant.
          </p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              Live Chat
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col min-h-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Bot className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to B.L.O.X. Chat
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Start a conversation with your AI CEO. Ask about business operations, 
                    strategic decisions, or get guidance on your AI workforce.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'blox' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.toolsUsed && message.toolsUsed.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          {message.toolsUsed.map((tool, idx) => (
                            <p key={idx} className="text-xs text-gray-500 italic">
                              ({tool.agentName} {tool.summary || `used ${tool.toolKey}`})
                            </p>
                          ))}
                        </div>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-gray-600">B.L.O.X. is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to B.L.O.X..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
