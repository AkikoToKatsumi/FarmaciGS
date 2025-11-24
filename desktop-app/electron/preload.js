const { contextBridge, ipcRenderer } = require('electron');

// Try to load XLSX, but handle gracefully if not available
let XLSX;
try {
  XLSX = require('xlsx');
} catch (error) {
  console.warn('XLSX module not available:', error.message);
  XLSX = null;
}

// API segura para la aplicación React
contextBridge.exposeInMainWorld('electronAPI', {
  // Configuración
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  testConnection: (serverUrl) => ipcRenderer.invoke('test-connection', serverUrl),
  
  // Notificaciones
  showError: (title, message) => ipcRenderer.invoke('show-error', title, message),
  
  // Control de ventana
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeApp: () => ipcRenderer.invoke('close-app'),
  
  // Info de la aplicación
  isElectron: true,
  platform: process.platform,
  
  // Eventos
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  
  // Almacenamiento local mejorado
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key),
    clear: () => ipcRenderer.invoke('store-clear')
  },

  // XLSX functionality - only expose if module is available
  XLSX: XLSX ? {
    utils: {
      json_to_sheet: XLSX.utils.json_to_sheet,
      book_new: XLSX.utils.book_new,
      book_append_sheet: XLSX.utils.book_append_sheet,
      sheet_add_aoa: XLSX.utils.sheet_add_aoa
    },
    writeFile: XLSX.writeFile
  } : null,

  // Proveer ruta a la base de datos empaquetada
  getDatabasePath: async () => {
    return await ipcRenderer.invoke('get-database-path');
  },

  // Database queries
  db: {
    query: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
    login: (email, password) => ipcRenderer.invoke('db-login', email, password)
  }
});
