import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { BackendStatus } from '@/types';

interface ConnectionStatusProps {
  status: BackendStatus | null;
  isLoading: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-sm text-muted-foreground">Checking connection...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <WifiOff className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-600">Backend disconnected</span>
      </div>
    );
  }

  const isHealthy = status.status === 'healthy';
  const isDegraded = status.status === 'degraded';
  const backendHealthy = status.backend_health.status === 'healthy';

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
        isHealthy
          ? 'bg-green-500/10 border-green-500/20'
          : isDegraded
          ? 'bg-yellow-500/10 border-yellow-500/20'
          : 'bg-red-500/10 border-red-500/20'
      }`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {isHealthy ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : isDegraded ? (
        <AlertCircle className="w-4 h-4 text-yellow-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-500" />
      )}
      
      <div className="flex flex-col">
        <span
          className={`text-sm font-medium ${
            isHealthy
              ? 'text-green-600'
              : isDegraded
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}
        >
          {isHealthy ? 'Connected' : isDegraded ? 'Degraded' : 'Disconnected'}
        </span>
        <span className="text-xs text-muted-foreground">
          {status.model_provider.toUpperCase()} {backendHealthy ? 'Ready' : 'Not Available'}
        </span>
      </div>
    </motion.div>
  );
};
