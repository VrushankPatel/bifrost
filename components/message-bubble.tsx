'use client';

import { Message } from './app-shell';
import { User, Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
        }
      `}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`
          inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser 
            ? 'bg-primary text-primary-foreground rounded-br-md' 
            : 'bg-card border border-border rounded-bl-md shadow-sm'
          }
        `}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        
        {/* Timestamp */}
        <div className={`
          text-xs text-muted-foreground mt-1 px-1
          ${isUser ? 'text-right' : 'text-left'}
        `}>
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}