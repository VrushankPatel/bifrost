'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare } from 'lucide-react';
import { Conversation } from './app-shell';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant={activeConversationId === conversation.id ? "secondary" : "ghost"}
              className="w-full justify-start p-3 h-auto text-left group hover:bg-accent/50 transition-colors"
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start gap-3 w-full min-w-0">
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate mb-1">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(conversation.lastMessage, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </Button>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new conversation to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}