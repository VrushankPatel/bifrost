import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BifrostIcon } from './BifrostIcon';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <motion.div 
      className={cn(
        "flex gap-4 max-w-4xl mx-auto",
        isUser ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {!isUser && (
        <motion.div 
          className="flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <BifrostIcon className="h-5 w-5 text-primary" />
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className={cn(
          "group relative max-w-[75%] rounded-2xl px-5 py-4 transition-all duration-200",
          isUser 
            ? "bg-user-message text-user-message-foreground ml-12 shadow-sm" 
            : "bg-assistant-message text-assistant-message-foreground border border-border/50 shadow-sm"
        )}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.1 }}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="mb-0 leading-relaxed whitespace-pre-wrap font-medium">
            {message.content}
          </p>
        </div>
        
        {!isUser && (
          <motion.div 
            className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-200"
            initial={{ y: 10 }}
            animate={{ y: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3 text-xs hover:bg-muted/60 transition-all duration-200"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-muted/60 transition-all duration-200"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-muted/60 transition-all duration-200"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
        
        <div className={cn(
          "absolute text-xs text-muted-foreground/60 mt-1 font-medium",
          "opacity-0 group-hover:opacity-100 transition-all duration-200",
          isUser ? "right-5 -bottom-6" : "left-5 -bottom-6"
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </motion.div>
      
      {isUser && (
        <motion.div 
          className="flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="h-10 w-10 rounded-2xl bg-muted/60 flex items-center justify-center border border-border/30">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};