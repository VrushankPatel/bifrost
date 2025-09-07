'use client';

import { useState, useEffect } from 'react';
import { ConversationList } from './conversation-list';
import { ChatWindow } from './chat-window';
import { ConfigPanel } from './config-panel';
import { ThemeToggle } from './theme-toggle';
import { Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: Date;
}

export interface BackendConfig {
  type: 'ollama' | 'lmstudio';
  port: number;
}

export function AppShell() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [backendConfig, setBackendConfig] = useState<BackendConfig>({
    type: 'ollama',
    port: 11434,
  });

  // Load initial data from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    const savedActiveId = localStorage.getItem('activeConversationId');
    const savedWebSearch = localStorage.getItem('webSearchEnabled');
    const savedBackendConfig = localStorage.getItem('backendConfig');

    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed.map((conv: any) => ({
        ...conv,
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
        lastMessage: new Date(conv.lastMessage),
      })));
    } else {
      // Create initial mock conversations
      const mockConversations: Conversation[] = [
        {
          id: '1',
          title: 'Getting Started with AI',
          messages: [
            {
              id: '1-1',
              content: 'Hello! How can I help you today?',
              role: 'assistant',
              timestamp: new Date(Date.now() - 3600000),
            },
          ],
          lastMessage: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          title: 'Code Review Discussion',
          messages: [
            {
              id: '2-1',
              content: 'Can you help me review this React component?',
              role: 'user',
              timestamp: new Date(Date.now() - 7200000),
            },
            {
              id: '2-2',
              content: 'Of course! Please share the component code and I\'ll provide a thorough review.',
              role: 'assistant',
              timestamp: new Date(Date.now() - 7200000 + 30000),
            },
          ],
          lastMessage: new Date(Date.now() - 7200000 + 30000),
        },
        {
          id: '3',
          title: 'API Integration Help',
          messages: [
            {
              id: '3-1',
              content: 'I need help integrating a REST API with my frontend.',
              role: 'user',
              timestamp: new Date(Date.now() - 86400000),
            },
          ],
          lastMessage: new Date(Date.now() - 86400000),
        },
      ];
      setConversations(mockConversations);
      setActiveConversationId('1');
    }

    if (savedActiveId) {
      setActiveConversationId(savedActiveId);
    }

    if (savedWebSearch) {
      setWebSearchEnabled(JSON.parse(savedWebSearch));
    }

    if (savedBackendConfig) {
      setBackendConfig(JSON.parse(savedBackendConfig));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('activeConversationId', activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    localStorage.setItem('webSearchEnabled', JSON.stringify(webSearchEnabled));
  }, [webSearchEnabled]);

  useEffect(() => {
    localStorage.setItem('backendConfig', JSON.stringify(backendConfig));
  }, [backendConfig]);

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const payload = {
      query: content,
      webSearchEnabled,
      backend: {
        type: backendConfig.type,
        port: backendConfig.port,
      },
    };

    console.log('Message Payload:', payload);

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: `I received your message: "${content}". This is a dummy response. In a real implementation, this would be processed by the ${backendConfig.type} backend running on port ${backendConfig.port}.${webSearchEnabled ? ' Web search would be enabled for this query.' : ''}`,
      role: 'assistant',
      timestamp: new Date(Date.now() + 1000),
    };

    if (activeConversationId) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          const updatedMessages = [...conv.messages, newMessage, assistantMessage];
          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: assistantMessage.timestamp,
            title: conv.messages.length === 0 ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : conv.title,
          };
        }
        return conv;
      }));
    } else {
      // Create new conversation
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [newMessage, assistantMessage],
        lastMessage: assistantMessage.timestamp,
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {activeConversation?.title || 'New Conversation'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <ChatWindow
          messages={activeConversation?.messages || []}
          onSendMessage={handleSendMessage}
          webSearchEnabled={webSearchEnabled}
          onWebSearchToggle={setWebSearchEnabled}
        />
      </div>

      {/* Config Panel */}
      <ConfigPanel
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        backendConfig={backendConfig}
        onBackendConfigChange={setBackendConfig}
      />
    </div>
  );
}