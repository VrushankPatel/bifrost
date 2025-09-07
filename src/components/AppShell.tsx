import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { ThemeToggle } from './ThemeToggle';
import { ConfigPanel } from './ConfigPanel';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BifrostIcon } from './BifrostIcon';
import { useAppConfig } from '@/hooks/useAppConfig';

export const AppShell: React.FC = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDark, setIsDark] = useState(true); // Dark mode as default
  const { config } = useAppConfig();

  useEffect(() => {
    // Check for saved theme or default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Apply accent color theme
    document.documentElement.setAttribute('data-accent', config.theme.accentColor);
  }, []);

  useEffect(() => {
    // Update accent color when config changes
    document.documentElement.setAttribute('data-accent', config.theme.accentColor);
    console.log('Applied accent color:', config.theme.accentColor);
  }, [config.theme.accentColor]);

  return (
    <motion.div 
      className="flex h-screen w-full bg-background overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glassmorphism Sidebar */}
      <motion.div 
        className="w-80 glass-subtle border-r border-sidebar-border flex flex-col relative"
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header with Bifrost Branding */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border/50">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <BifrostIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">
                Bifrost
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                AI Assistant
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
              className="text-sidebar-foreground hover:bg-sidebar-surface/60 transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Conversation List */}
        <ConversationList />
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-chat-background">
        <ChatWindow />
      </div>

      {/* Configuration Panel */}
      <AnimatePresence>
        {isConfigOpen && (
          <ConfigPanel 
            isOpen={isConfigOpen} 
            onClose={() => setIsConfigOpen(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};