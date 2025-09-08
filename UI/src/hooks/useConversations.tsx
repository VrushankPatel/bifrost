import { useState, useEffect, createContext, useContext } from 'react';
import { Conversation, Message } from '@/types';

interface ConversationsContextValue {
	conversations: Conversation[];
	activeConversation?: Conversation;
	activeConversationId: string | null;
	createConversation: (title?: string) => Promise<Conversation>;
	deleteConversation: (conversationId: string) => Promise<boolean>;
	switchConversation: (conversationId: string) => void;
	addMessageToConversation: (conversationId: string, message: Message) => void;
	loadConversations: () => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);

const useProvideConversations = (): ConversationsContextValue => {
	const [conversations, setConversations] = useState<Conversation[]>([
		{
			id: '1',
			title: 'Neural Architecture Design',
			timestamp: '2 hours ago',
			preview: 'Discussing optimal transformer architectures...',
			messages: [
				{
					id: '1',
					content: "Welcome to Bifrost! I'm your professional AI assistant, ready to help with any questions or tasks. How can I assist you today?",
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

	const [activeConversationId, setActiveConversationId] = useState<string | null>('1');

	// Load conversations from backend on mount
	useEffect(() => {
		loadConversations();
	}, []);

	const loadConversations = async () => {
		try {
			const response = await fetch('http://localhost:8000/api/conversations');
			if (response.ok) {
				const data = await response.json();
				const loaded: Conversation[] = data.conversations || [];
				const normalized: Conversation[] = loaded.map((conv) => ({
					...conv,
					messages: (conv.messages || []).map((m) => ({
						...m,
						timestamp: m && (m as any).timestamp && typeof (m as any).timestamp !== 'object'
							? new Date((m as any).timestamp)
							: (m as any).timestamp instanceof Date
							? (m as any).timestamp
							: new Date()
					}))
				}));
				setConversations(normalized);
				// Ensure an active conversation is selected
				if (!activeConversationId || !loaded.find(c => c.id === activeConversationId)) {
					setActiveConversationId(loaded.length > 0 ? loaded[0].id : null);
				}
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
			const response = await fetch('http://localhost:8000/api/conversations', {
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
			const response = await fetch(`http://localhost:8000/api/conversations/${conversationId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				setConversations(prev => prev.filter(conv => conv.id !== conversationId));
				// Switch to first available conversation or create new one
				const remainingConversations = conversations.filter(conv => conv.id !== conversationId);
				if (remainingConversations.length > 0) {
					setActiveConversationId(remainingConversations[0].id);
				} else {
					const created = await createConversation();
					setActiveConversationId(created.id);
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
			const created = await createConversation();
			setActiveConversationId(created.id);
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

	const activeConversation = conversations.find(conv => conv.id === activeConversationId!);

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

export const ConversationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const value = useProvideConversations();
	return (
		<ConversationsContext.Provider value={value}>
			{children}
		</ConversationsContext.Provider>
	);
};

export const useConversations = (): ConversationsContextValue => {
	const ctx = useContext(ConversationsContext);
	if (!ctx) {
		throw new Error('useConversations must be used within a ConversationsProvider');
	}
	return ctx;
};