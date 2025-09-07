import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useConversations } from '@/hooks/useConversations';
import { useAppConfig } from '@/hooks/useAppConfig';
import { Message } from '@/types';

export const ChatWindow: React.FC = () => {
  const { activeConversation, addMessageToConversation } = useConversations();
  const { config } = useAppConfig();

  const handleSendMessage = (content: string) => {
    if (!activeConversation) return;
    
    // Create payload as specified
    const payload = {
      conversationId: activeConversation.id,
      query: content,
      webSearchEnabled: config.webSearchEnabled,
      backend: config.backend
    };
    
    console.log('Query received:', payload);
    
    // Add user message with animation
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };
    
    addMessageToConversation(activeConversation.id, userMessage);
    
    // Simulate assistant response with delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Query received and processed through Bifrost. Your message: "${content}" has been analyzed using ${config.backend.type} backend on port ${config.backend.port}.${config.webSearchEnabled ? ' Web search capabilities were enabled for enhanced context.' : ' This query was processed locally without web search.'}`,
        role: 'assistant',
        timestamp: new Date()
      };
      addMessageToConversation(activeConversation.id, assistantMessage);
    }, 1200);
  };

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No conversation selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-chat-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {activeConversation.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.4, 
                delay: index === activeConversation.messages.length - 1 ? 0.2 : 0,
                ease: "easeOut"
              }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area with Glass Effect */}
      <motion.div 
        className="border-t border-border/50 bg-surface/50 backdrop-blur-xl p-6"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </motion.div>
    </div>
  );
};