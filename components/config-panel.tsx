'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BackendConfig } from './app-shell';
import { Save, Server, Zap } from 'lucide-react';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  backendConfig: BackendConfig;
  onBackendConfigChange: (config: BackendConfig) => void;
}

export function ConfigPanel({
  isOpen,
  onClose,
  backendConfig,
  onBackendConfigChange,
}: ConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<BackendConfig>(backendConfig);

  useEffect(() => {
    setLocalConfig(backendConfig);
  }, [backendConfig]);

  const handleSave = () => {
    onBackendConfigChange(localConfig);
    onClose();
  };

  const handleBackendTypeChange = (type: 'ollama' | 'lmstudio') => {
    const defaultPorts = {
      ollama: 11434,
      lmstudio: 1234,
    };
    
    setLocalConfig({
      type,
      port: defaultPorts[type],
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Backend Configuration
          </SheetTitle>
          <SheetDescription>
            Configure your AI backend settings. Changes will be saved automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Backend Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="backend-type">Backend Type</Label>
            <Select
              value={localConfig.type}
              onValueChange={handleBackendTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select backend type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Ollama
                  </div>
                </SelectItem>
                <SelectItem value="lmstudio">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    LM Studio
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Port Configuration */}
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              value={localConfig.port}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                port: parseInt(e.target.value) || prev.port,
              }))}
              placeholder="Enter port number"
              min="1"
              max="65535"
            />
            <p className="text-xs text-muted-foreground">
              Default ports: Ollama (11434), LM Studio (1234)
            </p>
          </div>

          {/* Backend Info */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Current Configuration
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend:</span>
                <span className="font-medium capitalize">{localConfig.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endpoint:</span>
                <span className="font-mono text-xs">
                  http://localhost:{localConfig.port}
                </span>
              </div>
            </div>
          </div>

          {/* Backend Descriptions */}
          <div className="space-y-4">
            <div className="text-sm">
              <h4 className="font-medium mb-2">Backend Information:</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Ollama
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Local AI model runner. Default port: 11434
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="font-medium text-green-900 dark:text-green-100 mb-1">
                    LM Studio
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Desktop app for running LLMs locally. Default port: 1234
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}