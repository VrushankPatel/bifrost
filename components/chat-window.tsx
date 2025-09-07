'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Message } from './app-shell';
import { useEffect, useRef } from 'react';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  webSearchEnabled: boolean;
  onWebSearchToggle: (enabled: boolean) => void;
}

export function ChatWindow({
  messages,
  onSendMessage,
  webSearchEnabled,
  onWebSearchToggle,
}: ChatWindowProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground">
                Start a conversation by typing a message below
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <ChatInput
            onSendMessage={onSendMessage}
            webSearchEnabled={webSearchEnabled}
            onWebSearchToggle={onWebSearchToggle}
          />
        </div>
      </div>
    </div>
  );
}