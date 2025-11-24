// Hook personalizado para Electron
import { useState, useEffect } from 'react';

interface ElectronAPI {
  getConfig: () => Promise<{
    serverUrl: string;
    theme: string;
    autoConnect: boolean;
  }>;
  saveConfig: (config: any) => Promise<boolean>;
  testConnection: (serverUrl: string) => Promise<boolean>;
  showError: (title: string, message: string) => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeApp: () => Promise<void>;
  isElectron: boolean;
  platform: string;
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };
  XLSX: {
    utils: {
      json_to_sheet: (data: any[]) => any;
      book_new: () => any;
      book_append_sheet: (workbook: any, worksheet: any, name: string) => void;
      sheet_add_aoa: (worksheet: any, data: any[][], options: { origin: string }) => void;
    };
    writeFile: (workbook: any, filename: string) => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI | undefined;
  }
}

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<ElectronAPI | undefined>(undefined);

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true);
      setElectronAPI(window.electronAPI);
    }
  }, []);

  return {
    isElectron,
    electronAPI,
    // Helpers
    isDesktopApp: isElectron,
    platform: electronAPI?.platform || 'web'
  };
};

// Hook para configuración del servidor
export const useServerConfig = () => {
  const { electronAPI } = useElectron();
  const [config, setConfig] = useState({
    serverUrl: 'http://localhost:4004',
    theme: 'light',
    autoConnect: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, [electronAPI]);

  const loadConfig = async () => {
    if (electronAPI) {
      try {
        const savedConfig = await electronAPI.getConfig();
        setConfig(savedConfig);
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
    setIsLoading(false);
  };

  const saveConfig = async (newConfig: Partial<typeof config>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    if (electronAPI) {
      try {
        await electronAPI.saveConfig(updatedConfig);
        return true;
      } catch (error) {
        console.error('Error saving config:', error);
        return false;
      }
    }
    return false;
  };

  const testConnection = async (serverUrl?: string) => {
    const urlToTest = serverUrl || config.serverUrl;
    if (electronAPI) {
      try {
        return await electronAPI.testConnection(urlToTest);
      } catch (error) {
        console.error('Error testing connection:', error);
        return false;
      }
    }
    return false;
  };

  return {
    config,
    saveConfig,
    testConnection,
    isLoading
  };
};

// Hook para almacenamiento local mejorado
export const useElectronStore = (key: string, defaultValue: any = null) => {
  const { electronAPI } = useElectron();
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadValue();
  }, [key, electronAPI]);

  const loadValue = async () => {
    if (electronAPI) {
      try {
        const stored = await electronAPI.store.get(key);
        setValue(stored !== undefined ? stored : defaultValue);
      } catch (error) {
        console.error('Error loading from store:', error);
        setValue(defaultValue);
      }
    } else {
      // Fallback a localStorage para web
      try {
        const stored = localStorage.getItem(key);
        setValue(stored ? JSON.parse(stored) : defaultValue);
      } catch (error) {
        setValue(defaultValue);
      }
    }
    setIsLoading(false);
  };

  const saveValue = async (newValue: any) => {
    setValue(newValue);
    
    if (electronAPI) {
      try {
        await electronAPI.store.set(key, newValue);
      } catch (error) {
        console.error('Error saving to store:', error);
      }
    } else {
      // Fallback a localStorage para web
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  };

  const deleteValue = async () => {
    setValue(defaultValue);
    
    if (electronAPI) {
      try {
        await electronAPI.store.delete(key);
      } catch (error) {
        console.error('Error deleting from store:', error);
      }
    } else {
      localStorage.removeItem(key);
    }
  };

  return {
    value,
    setValue: saveValue,
    deleteValue,
    isLoading
  };
};
