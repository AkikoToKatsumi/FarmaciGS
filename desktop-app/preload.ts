import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Notifications
  showNotification: (title: string, body: string) => 
    ipcRenderer.invoke('show-notification', title, body),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Window operations
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Navigation listeners
  onNavigateTo: (callback: (path: string) => void) => {
    ipcRenderer.on('navigate-to', (event, path) => callback(path));
  },
  
  onExportData: (callback: (filePath: string) => void) => {
    ipcRenderer.on('export-data', (event, filePath) => callback(filePath));
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Expose node environment info
contextBridge.exposeInMainWorld('nodeAPI', {
  platform: process.platform,
  version: process.version
});

// Type definitions for the exposed API
export interface ElectronAPI {
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  showNotification: (title: string, body: string) => Promise<void>;
  getAppVersion: () => Promise<string>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  onNavigateTo: (callback: (path: string) => void) => void;
  onExportData: (callback: (filePath: string) => void) => void;
  removeAllListeners: (channel: string) => void;
}

export interface NodeAPI {
  platform: string;
  version: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    nodeAPI: NodeAPI;
  }
}