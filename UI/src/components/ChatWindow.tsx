import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useConversations } from '@/hooks/useConversations';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { Message } from '@/types';

export const ChatWindow: React.FC = () => {
  const { activeConversation, addMessageToConversation } = useConversations();
  const { config } = useAppConfig();
  const { status } = useBackendStatus();

  const handleSendMessage = async (content: string) => {
    if (!activeConversation) return;
    // Block sending if backend unhealthy
    if (!status || status.status === 'unhealthy') {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `🚫 Backend not available. Please start ${config.backend.type === 'ollama' ? 'Ollama (ollama serve)' : 'LM Studio (lms server start)'} and try again.`,
        role: 'assistant',
        timestamp: new Date()
      };
      addMessageToConversation(activeConversation.id, assistantMessage);
      return;
    }
    
    // Create payload as specified
    const payload = {
      conversationId: activeConversation.id,
      query: content,
      webSearchEnabled: config.webSearchEnabled,
      backend: config.backend,
      // optional: selected model persisted in localStorage by config panel
      model: (JSON.parse(localStorage.getItem('appConfig') || '{}')?.model) || undefined
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
    
    try {
      // Call backend API
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message.content,
        role: 'assistant',
        timestamp: new Date()
      };
      
      addMessageToConversation(activeConversation.id, assistantMessage);
      
    } catch (error) {
      console.error('Error calling backend API:', error);
      
      // Check if backend is available
      const isBackendUnavailable = !status || status.status === 'unhealthy';
      const backendName = config.backend.type === 'ollama' ? 'Ollama' : 'LM Studio';
      
      let errorMessage = '';
      if (isBackendUnavailable) {
        errorMessage = `🚫 **Backend Unavailable**\n\nI can't connect to ${backendName} on port ${config.backend.port}. Please:\n\n1. **Install ${backendName}**: ${config.backend.type === 'ollama' ? 'https://ollama.ai' : 'https://lmstudio.ai'}\n2. **Start the server**: ${config.backend.type === 'ollama' ? '`ollama serve`' : '`lms server start`'}\n3. **Pull a model**: ${config.backend.type === 'ollama' ? '`ollama pull llama3.2`' : 'Load a model in LM Studio'}\n\nOnce running, I'll be able to help you!`;
      } else {
        errorMessage = `⚠️ **Connection Error**\n\nI'm having trouble processing your request. Please try again in a moment.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date()
      };
      
      addMessageToConversation(activeConversation.id, assistantMessage);
    }
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