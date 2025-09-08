import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/useConversations';

export const ConversationList: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    createConversation,
    deleteConversation,
    switchConversation
  } = useConversations();

  const handleNewConversation = async () => {
    await createConversation();
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(conversationId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Conversation Button */}
      <motion.div 
        className="p-4 border-b border-sidebar-border/50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Button 
          onClick={handleNewConversation}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-200 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </motion.div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
              onClick={() => switchConversation(conversation.id)}
              className={cn(
                "group flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200",
                "hover:bg-sidebar-surface/60 glass-subtle",
                activeConversationId === conversation.id 
                  ? "bg-sidebar-surface/80 border border-primary/20 shadow-sm" 
                  : ""
              )}
            >
              <MessageSquare className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-sidebar-foreground truncate">
                    {conversation.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-muted/60 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1 font-medium">
                  {conversation.preview}
                </p>
                <p className="text-xs text-muted-foreground/80 mt-2">
                  {conversation.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};