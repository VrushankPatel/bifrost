import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Cpu } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvailableModels } from '@/types';

interface ModelSelectorProps {
  availableModels: AvailableModels | null;
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  availableModels,
  selectedModel,
  onModelChange,
  disabled = false
}) => {
  const models = availableModels?.models || [];
  const provider = availableModels?.provider || 'unknown';

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Cpu className="w-4 h-4 text-muted-foreground" />
      <Select
        value={selectedModel}
        onValueChange={onModelChange}
        disabled={disabled || models.length === 0}
      >
        <SelectTrigger className="w-[200px] h-8 text-sm">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {models.length > 0 ? (
            models.map((model) => (
              <SelectItem key={model} value={model} className="text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {model}
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-models" disabled>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                No models available
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      {models.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {models.length} model{models.length !== 1 ? 's' : ''} available
        </div>
      )}
    </motion.div>
  );
};
