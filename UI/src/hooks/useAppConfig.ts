import { useState, useEffect } from 'react';
import { AppConfig } from '@/types';
import { toast } from '@/hooks/use-toast';

const DEFAULT_CONFIG: AppConfig = {
  backend: {
    type: 'ollama',
    port: 11434
  },
  theme: {
    accentColor: 'emerald' // emerald, blue, purple, amber, rose, indigo
  },
  webSearchEnabled: false
};

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // Try to load from backend first
      const response = await fetch('http://localhost:8000/api/config');
      
      if (response.ok) {
        const serverConfig = await response.json();
        setConfig(serverConfig);
        // Cache in localStorage
        localStorage.setItem('appConfig', JSON.stringify(serverConfig));
        return;
      }
    } catch (error) {
      console.log('Loading config from localStorage - backend not available:', error);
    }

    // Fallback to localStorage
    const localConfig = localStorage.getItem('appConfig');
    if (localConfig) {
      setConfig(JSON.parse(localConfig));
    } else {
      // Apply default config
      setConfig(DEFAULT_CONFIG);
      localStorage.setItem('appConfig', JSON.stringify(DEFAULT_CONFIG));
    }
  };

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    
    // Apply theme changes immediately to DOM
    if (newConfig.theme?.accentColor) {
      document.documentElement.setAttribute('data-accent', newConfig.theme.accentColor);
    }
    
    // Update local state immediately for responsive UI
    setConfig(updatedConfig);
    localStorage.setItem('appConfig', JSON.stringify(updatedConfig));
    
    try {
      // Try to save to backend first
      const response = await fetch('http://localhost:8000/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });

      if (response.ok) {
        const serverConfig = await response.json();
        console.log('Configuration saved to backend:', serverConfig);
        toast({
          title: "Settings Saved",
          description: "Your configuration has been saved successfully.",
        });
        return;
      }
    } catch (error) {
      console.log('Saving config to localStorage - backend not available:', error);
      toast({
        title: "Settings Saved Locally",
        description: "Configuration saved locally. Backend not available.",
        variant: "default"
      });
    }
  };

  const updateTheme = (accentColor: string) => {
    updateConfig({ theme: { accentColor } });
  };

  const updateBackend = (backend: AppConfig['backend']) => {
    updateConfig({ backend });
    // Also update legacy backendConfig for backward compatibility
    localStorage.setItem('backendConfig', JSON.stringify(backend));
  };

  const toggleWebSearch = () => {
    updateConfig({ webSearchEnabled: !config.webSearchEnabled });
  };

  return {
    config,
    updateConfig,
    updateTheme,
    updateBackend,
    toggleWebSearch,
    loadConfig
  };
};