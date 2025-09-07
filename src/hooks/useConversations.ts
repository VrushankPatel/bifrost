import { useState, useEffect } from 'react';
import { Conversation, Message } from '@/types';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Neural Architecture Design',
      timestamp: '2 hours ago',
      preview: 'Discussing optimal transformer architectures...',
      messages: [
        {
          id: '1',
          content: 'Welcome to Bifrost! I\'m your professional AI assistant, ready to help with any questions or tasks. How can I assist you today?',
          role: 'assistant',
          timestamp: new Date()
        }
      ]
    },
    {
      id: '2',
      title: 'Data Pipeline Optimization',
      timestamp: '1 day ago',
      preview: 'How to streamline ETL processes for ML...',
      messages: []
    },
    {
      id: '3',
      title: 'API Integration Strategy',
      timestamp: '3 days ago',
      preview: 'Best practices for microservices architecture...',
      messages: []
    }
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string>('1');

  // Load conversations from backend on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const backendConfig = JSON.parse(localStorage.getItem('backendConfig') || '{"type": "ollama", "port": 11434}');
      const response = await fetch(`http://localhost:${backendConfig.port}/api/conversations`);
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || conversations);
      }
    } catch (error) {
      console.log('Using local conversations - backend not available:', error);
    }
  };

  const createConversation = async (title: string = 'New Conversation') => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title,
      timestamp: 'Just now',
      preview: 'New conversation started...',
      messages: []
    };

    try {
      const backendConfig = JSON.parse(localStorage.getItem('backendConfig') || '{"type": "ollama", "port": 11434}');
      const response = await fetch(`http://localhost:${backendConfig.port}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConversation)
      });

      if (response.ok) {
        const savedConversation = await response.json();
        setConversations(prev => [savedConversation, ...prev]);
        setActiveConversationId(savedConversation.id);
        return savedConversation;
      }
    } catch (error) {
      console.log('Creating conversation locally - backend not available:', error);
    }

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const backendConfig = JSON.parse(localStorage.getItem('backendConfig') || '{"type": "ollama", "port": 11434}');
      const response = await fetch(`http://localhost:${backendConfig.port}/api/conversations/${conversationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // Switch to first available conversation or create new one
        const remainingConversations = conversations.filter(conv => conv.id !== conversationId);
        if (remainingConversations.length > 0) {
          setActiveConversationId(remainingConversations[0].id);
        } else {
          await createConversation();
        }
        return true;
      }
    } catch (error) {
      console.log('Deleting conversation locally - backend not available:', error);
    }

    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    const remainingConversations = conversations.filter(conv => conv.id !== conversationId);
    if (remainingConversations.length > 0) {
      setActiveConversationId(remainingConversations[0].id);
    } else {
      await createConversation();
    }
    return true;
  };

  const switchConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const addMessageToConversation = (conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, message],
            preview: message.content.substring(0, 50) + '...',
            timestamp: 'Just now'
          }
        : conv
    ));
  };

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    createConversation,
    deleteConversation,
    switchConversation,
    addMessageToConversation,
    loadConversations
  };
};