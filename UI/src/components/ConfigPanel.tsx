import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Zap, Settings2, Palette } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { ConnectionStatus } from './ConnectionStatus';
import { ModelSelector } from './ModelSelector';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ isOpen, onClose }) => {
  const { config, updateBackend, updateTheme } = useAppConfig();
  const { status, availableModels, refreshModels } = useBackendStatus();
  const [tempBackend, setTempBackend] = useState(config.backend);
  const [tempTheme, setTempTheme] = useState(config.theme.accentColor);
  const [selectedModel, setSelectedModel] = useState('llama3.2');

  const handleSave = () => {
    updateBackend(tempBackend);
    updateTheme(tempTheme);
    
    // Log the configuration payload that would be sent to backend
    const configPayload = {
      backend: tempBackend,
      theme: { accentColor: tempTheme },
      webSearchEnabled: config.webSearchEnabled,
      timestamp: new Date().toISOString(),
      userId: 'user-123', // This would come from authentication
      model: selectedModel
    };
    
    console.log('Configuration payload for backend:', configPayload);
    onClose();
  };

  // Apply theme changes immediately when user selects different color
  const handleThemeChange = (newTheme: string) => {
    setTempTheme(newTheme);
    // Apply immediately to DOM for instant feedback
    document.documentElement.setAttribute('data-accent', newTheme);
  };

  const handleBackendTypeChange = (type: 'ollama' | 'lmstudio') => {
    const defaultPorts = {
      ollama: 11434,
      lmstudio: 1234
    };
    
    setTempBackend({
      type,
      port: defaultPorts[type]
    });
    
    // Refresh models when backend type changes
    refreshModels(type);
  };

  const accentColors = [
    { name: 'Emerald', value: 'emerald', color: 'bg-emerald-500' },
    { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
    { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
    { name: 'Amber', value: 'amber', color: 'bg-amber-500' },
    { name: 'Rose', value: 'rose', color: 'bg-rose-500' },
    { name: 'Indigo', value: 'indigo', color: 'bg-indigo-500' }
  ];

  const backendInfo = {
    ollama: {
      name: 'Ollama',
      description: 'Local AI models with Ollama',
      defaultPort: 11434,
      url: 'https://ollama.ai',
      icon: <Server className="h-4 w-4" />,
      color: 'bg-emerald-500'
    },
    lmstudio: {
      name: 'LM Studio',
      description: 'Local inference with LM Studio',
      defaultPort: 1234,
      url: 'https://lmstudio.ai',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-amber-500'
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md glass border-border/50 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Bifrost Configuration
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                {/* Connection Status */}
                <ConnectionStatus status={status} isLoading={false} />

                {/* Backend Type Selection */}
                <div className="space-y-3">
                  <Label htmlFor="backend-type" className="text-sm font-semibold">
                    Backend Type
                  </Label>
                  <Select
                    value={tempBackend.type}
                    onValueChange={handleBackendTypeChange}
                  >
                    <SelectTrigger className="bg-surface-elevated/80 border-border/50">
                      <SelectValue placeholder="Select backend type" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-elevated/95 backdrop-blur-xl border-border/50">
                      <SelectItem value="ollama">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${backendInfo.ollama.color}`} />
                          Ollama
                        </div>
                      </SelectItem>
                      <SelectItem value="lmstudio">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${backendInfo.lmstudio.color}`} />
                          LM Studio
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Backend Info Card */}
                <Card className="bg-surface-elevated/60 border-border/40 glass-subtle">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      {backendInfo[tempBackend.type].icon}
                      {backendInfo[tempBackend.type].name}
                      <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary border-primary/20">
                        Port {tempBackend.port}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">
                      {backendInfo[tempBackend.type].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground font-medium">
                      Default endpoint: <code className="bg-muted/60 px-2 py-1 rounded border border-border/30 font-mono">
                        http://localhost:{tempBackend.port}
                      </code>
                    </div>
                  </CardContent>
                </Card>

                {/* Port Configuration */}
                <div className="space-y-2">
                  <Label htmlFor="port" className="text-sm font-semibold">
                    Port Number
                  </Label>
                  <Input
                    id="port"
                    type="number"
                    value={tempBackend.port}
                    onChange={(e) => setTempBackend({ ...tempBackend, port: parseInt(e.target.value) || 0 })}
                    placeholder="Enter port number"
                    min="1"
                    max="65535"
                    className="bg-surface-elevated/80 border-border/50 font-medium"
                  />
                  <p className="text-xs text-muted-foreground font-medium">
                    Make sure your {backendInfo[tempBackend.type].name} server is running on this port.
                  </p>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Available Models</Label>
                  <ModelSelector
                    availableModels={availableModels}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    disabled={!status || status.status === 'unhealthy'}
                  />
                  <p className="text-xs text-muted-foreground font-medium">
                    Select a model from your {backendInfo[tempBackend.type].name} installation.
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Theme Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Theme Settings</Label>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Accent Color</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleThemeChange(color.value)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border transition-all duration-200",
                            "hover:bg-surface-elevated/80",
                            tempTheme === color.value
                              ? "border-primary bg-primary/10"
                              : "border-border/50"
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded-full", color.color)} />
                          <span className="text-xs font-medium">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={onClose} 
                    className="flex-1 bg-surface-elevated/60 border-border/50 hover:bg-surface-elevated/80"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="flex-1 bg-primary hover:bg-primary/90 font-semibold"
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};