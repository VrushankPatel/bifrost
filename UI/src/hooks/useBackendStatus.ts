import { useState, useEffect } from 'react';
import { BackendStatus, AvailableModels } from '@/types';

export const useBackendStatus = () => {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [availableModels, setAvailableModels] = useState<AvailableModels | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        const statusData = await response.json();
        setStatus(statusData);
      }
    } catch (error) {
      console.error('Failed to check backend status:', error);
      setStatus({
        status: 'unhealthy',
        model_provider: 'unknown',
        backend_health: { status: 'unhealthy', provider: 'unknown' }
      });
    }
  };

  const loadModels = async (provider?: string) => {
    try {
      const url = provider ? `http://localhost:8000/api/models?provider=${provider}` : 'http://localhost:8000/api/models';
      const response = await fetch(url);
      if (response.ok) {
        const modelsData = await response.json();
        setAvailableModels(modelsData);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setAvailableModels({ models: [], provider: provider || 'unknown' });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([checkStatus(), loadModels()]);
      setIsLoading(false);
    };

    loadData();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshModels = (provider: string) => {
    loadModels(provider);
  };

  return {
    status,
    availableModels,
    isLoading,
    checkStatus,
    refreshModels
  };
};
