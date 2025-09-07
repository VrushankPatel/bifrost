export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
  messages: Message[];
}

export interface BackendConfig {
  type: 'ollama' | 'lmstudio';
  port: number;
}

export interface AppConfig {
  backend: BackendConfig;
  theme: {
    accentColor: string;
  };
  webSearchEnabled: boolean;
}

export interface ChatPayload {
  conversationId?: string;
  query: string;
  webSearchEnabled: boolean;
  backend: BackendConfig;
}

export interface ChatResponse {
  conversationId: string;
  message: {
    role: 'assistant';
    content: string;
  };
  done: boolean;
}

export interface ConversationListResponse {
  conversations: Conversation[];
}

export interface DeleteConversationResponse {
  success: boolean;
  message?: string;
}