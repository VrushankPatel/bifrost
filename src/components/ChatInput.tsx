import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Square, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppConfig } from '@/hooks/useAppConfig';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { config, toggleWebSearch } = useAppConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isGenerating) {
      setIsGenerating(true);
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset generating state after a delay (simulate processing)
      setTimeout(() => setIsGenerating(false), 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStop = () => {
    setIsGenerating(false);
    console.log('Stopping generation...');
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="relative flex items-end gap-4 p-4 bg-surface-elevated/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg glass-subtle focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all duration-300"
        whileFocus={{ scale: 1.01 }}
      >
        {/* Attachment Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/60 transition-all duration-200"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isGenerating ? "Bifrost is thinking..." : "Ask Bifrost anything..."}
          disabled={isGenerating}
          className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 font-medium"
          rows={1}
        />

        {/* Web Search Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/40 transition-colors">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={config.webSearchEnabled}
                onCheckedChange={toggleWebSearch}
                className="scale-75"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Web Search {config.webSearchEnabled ? 'Enabled' : 'Disabled'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Send/Stop Button */}
        {isGenerating ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              type="button"
              onClick={handleStop}
              size="sm"
              variant="secondary"
              className="rounded-2xl px-4 py-2 h-10 shadow-sm"
            >
              <Square className="h-3 w-3 mr-2" />
              Stop
            </Button>
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              disabled={!message.trim()}
              size="sm"
              className="rounded-2xl px-4 py-2 h-10 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm font-medium"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
      
      {/* Tips */}
      <div className="flex justify-between items-center mt-3 px-2">
        <p className="text-xs text-muted-foreground/80 font-medium">
          Press <kbd className="px-2 py-1 text-xs font-semibold bg-muted/60 rounded-md border border-border/50">Enter</kbd> to send, <kbd className="px-2 py-1 text-xs font-semibold bg-muted/60 rounded-md border border-border/50">Shift + Enter</kbd> for new line
        </p>
        {message.length > 0 && (
          <p className="text-xs text-muted-foreground/60 font-medium">
            {message.length} characters
          </p>
        )}
      </div>
    </motion.form>
  );
};