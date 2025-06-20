"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // File operations
    showSaveDialog: (options) => electron_1.ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => electron_1.ipcRenderer.invoke('show-open-dialog', options),
    // Notifications
    showNotification: (title, body) => electron_1.ipcRenderer.invoke('show-notification', title, body),
    // App info
    getAppVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    // Window operations
    minimizeWindow: () => electron_1.ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => electron_1.ipcRenderer.invoke('maximize-window'),
    closeWindow: () => electron_1.ipcRenderer.invoke('close-window'),
    // Navigation listeners
    onNavigateTo: (callback) => {
        electron_1.ipcRenderer.on('navigate-to', (event, path) => callback(path));
    },
    onExportData: (callback) => {
        electron_1.ipcRenderer.on('export-data', (event, filePath) => callback(filePath));
    },
    // Remove listeners
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    }
});
// Expose node environment info
electron_1.contextBridge.exposeInMainWorld('nodeAPI', {
    platform: process.platform,
    version: process.version
});
