const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');

// Disable hardware acceleration early to avoid GPU process crashes on some systems
try {
  app.disableHardwareAcceleration();
} catch (e) {
  // ignore if not supported in this Electron version
}
const { autoUpdater } = require('electron-updater');
let Store;
try {
  Store = require('electron-store');
} catch (err) {
  try {
    const unpackedPath = path.join(process.resourcesPath || process.cwd(), 'app.asar.unpacked', 'node_modules', 'electron-store');
    Store = require(unpackedPath);
  } catch (err2) {
    throw err;
  }
}
const log = require('electron-log');
const path = require('path');
const isDev = require('electron-is-dev');

// Configurar logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Configuraciones para mejorar rendimiento y reducir errores
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--ignore-gpu-blacklist');
app.commandLine.appendSwitch('--no-sandbox');

// En Windows, usar software rendering si hay problemas con GPU
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('--disable-features=VizDisplayCompositor');
}

// Store para configuraciones
const store = new Store({
  defaults: {
    serverUrl: 'http://localhost:4004',
    windowBounds: { width: 1200, height: 800 },
    theme: 'light',
    autoConnect: true,
    lastUser: null
  }
});

class FarmaciaApp {
  constructor() {
    this.mainWindow = null;
    this.configWindow = null;
    this.splashWindow = null;
    this.isQuitting = false;
  }

  // Crear ventana principal
  createMainWindow() {
    const { width, height } = store.get('windowBounds');
    
    this.mainWindow = new BrowserWindow({
      width,
      height,
      minWidth: 1000,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true
      },
      icon: path.join(__dirname, '../public/imagenes/logob.ico'),
      title: 'Farmacia GS - Sistema de Gestión',
      titleBarStyle: 'default',
      show: false,
      autoHideMenuBar: false
    });

    // Cargar desde dist
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('🔄 Cargando aplicación desde:', indexPath);
    
    this.mainWindow.loadFile(indexPath).catch((error) => {
      console.error('❌ Error cargando aplicación:', error);
    });

    // Configurar eventos
    this.setupMainWindowEvents();
    
    // Debugging: logs de eventos importantes
    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('✅ Aplicación cargada exitosamente');
    });
    
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('❌ Error al cargar:', errorCode, errorDescription);
    });
    
    // Mostrar cuando esté listo
    this.mainWindow.once('ready-to-show', () => {
      console.log('🚀 Mostrando ventana principal');
      this.hideSplashWindow();
      this.mainWindow.show();
      this.mainWindow.focus();
    });

    // Timeout de seguridad: mostrar ventana aunque no esté completamente lista
    setTimeout(() => {
      if (this.mainWindow && !this.mainWindow.isVisible()) {
        console.log('⏰ Timeout - Forzando mostrar ventana');
        this.hideSplashWindow();
        this.mainWindow.show();
      }
    }, 8000);
  }

  // Crear ventana de configuración
  createConfigWindow() {
    this.configWindow = new BrowserWindow({
      width: 500,
      height: 400,
      resizable: false,
      modal: true,
      parent: this.mainWindow,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      title: 'Configuración del Servidor'
    });

    this.configWindow.loadFile(path.join(__dirname, 'config.html'));
    
    this.configWindow.on('closed', () => {
      this.configWindow = null;
    });
  }

  // Crear splash screen
  createSplashWindow() {
    this.splashWindow = new BrowserWindow({
      width: 450,
      height: 350,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      },
      center: true,
      icon: path.join(__dirname, '../public/imagenes/logob.ico')
    });

    this.splashWindow.loadFile(path.join(__dirname, 'splash.html'));
    
    console.log('🎬 Splash screen creado');
    
    // Auto-cerrar después de un tiempo si la ventana principal no se abre
    setTimeout(() => {
      if (this.splashWindow && !this.splashWindow.isDestroyed()) {
        console.log('⏰ Auto-cerrando splash por timeout');
        this.hideSplashWindow();
      }
    }, 8000);
  }

  hideSplashWindow() {
    if (this.splashWindow) {
      console.log('🎬 Cerrando splash screen');
      this.splashWindow.close();
      this.splashWindow = null;
    }
  }

  // Configurar eventos de la ventana principal
  setupMainWindowEvents() {
    // Guardar tamaño de ventana
    this.mainWindow.on('resize', () => {
      const bounds = this.mainWindow.getBounds();
      store.set('windowBounds', bounds);
    });

    // Manejar cierre
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting && process.platform === 'darwin') {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Manejar links externos
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  // Crear nueva ventana
  createNewWindow() {
    const newWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 1000,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true
      },
      icon: path.join(__dirname, '../public/imagenes/logob.ico'),
      title: 'Farmacia GS - Sistema de Gestión',
      titleBarStyle: 'default',
      show: false,
      autoHideMenuBar: false
    });

    // Cargar desde dist
    const indexPath = path.join(__dirname, '../dist/index.html');
    newWindow.loadFile(indexPath);

    // Mostrar cuando esté listo
    newWindow.once('ready-to-show', () => {
      newWindow.show();
    });

    // Manejar cierre
    newWindow.on('closed', () => {
      // La ventana se cierra automáticamente
    });

    // Manejar links externos
    newWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    return newWindow;
  }

  // Crear menú de aplicación
  createMenu() {
    const template = [
      {
        label: 'Archivo',
        submenu: [
          {
            label: 'Configuración del Servidor',
            accelerator: 'CmdOrCtrl+,',
            click: () => this.openConfigWindow()
          },
          { type: 'separator' },
          {
            label: 'Salir',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              this.isQuitting = true;
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Editar',
        submenu: [
          { role: 'undo', label: 'Deshacer' },
          { role: 'redo', label: 'Rehacer' },
          { type: 'separator' },
          { role: 'cut', label: 'Cortar' },
          { role: 'copy', label: 'Copiar' },
          { role: 'paste', label: 'Pegar' }
        ]
      },
      {
        label: 'Ver',
        submenu: [
          { role: 'reload', label: 'Recargar' },
          { role: 'forceReload', label: 'Forzar Recarga' },
          { role: 'toggleDevTools', label: 'Herramientas de Desarrollo' },
          { type: 'separator' },
          { role: 'resetZoom', label: 'Zoom Normal' },
          { role: 'zoomIn', label: 'Acercar' },
          { role: 'zoomOut', label: 'Alejar' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Pantalla Completa' }
        ]
      },
      {
        label: 'Ventana',
        submenu: [
          {
            label: 'Nueva Ventana',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.createNewWindow()
          },
          { type: 'separator' },
          { role: 'minimize', label: 'Minimizar' },
          { role: 'close', label: 'Cerrar' }
        ]
      },
      {
        label: 'Ayuda',
        submenu: [
          {
            label: 'Acerca de Farmacia GS',
            click: () => this.showAboutDialog()
          },
          {
            label: 'Comprobar Actualizaciones',
            click: () => {
              if (!isDev) {
                autoUpdater.checkForUpdatesAndNotify();
              }
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  // Abrir ventana de configuración
  openConfigWindow() {
    if (this.configWindow) {
      this.configWindow.focus();
    } else {
      this.createConfigWindow();
    }
  }

  // Mostrar diálogo "Acerca de"
  showAboutDialog() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Acerca de Farmacia GS',
      message: 'Farmacia GS',
      detail: `Versión: ${app.getVersion()}\n\nSistema de Gestión Farmacéutica\n\nDesarrollado por:\n• Gabriela García (2023-0105)\n• Dauris Santana (2023-0253)\n\nUniversidad Católica Tecnológica del Cibao (UCATECI)\nDonado a INFOTEP para fines educativos\n\n© 2025 Todos los derechos reservados.`,
      buttons: ['OK']
    });
  }

  // Configurar IPC handlers
  setupIPC() {
    // Obtener configuración
    ipcMain.handle('get-config', () => {
      return {
        serverUrl: store.get('serverUrl'),
        theme: store.get('theme'),
        autoConnect: store.get('autoConnect')
      };
    });

    // Guardar configuración
    ipcMain.handle('save-config', (event, config) => {
      store.set('serverUrl', config.serverUrl);
      store.set('theme', config.theme);
      store.set('autoConnect', config.autoConnect);
      return true;
    });

    // Probar conexión
    ipcMain.handle('test-connection', async (event, serverUrl) => {
      // Implementar lógica de prueba de conexión
      return { success: true, message: 'Conexión exitosa' };
    });

    // Mostrar errores
    ipcMain.handle('show-error', (event, title, message) => {
      dialog.showErrorBox(title, message);
    });

    // Store handlers
    ipcMain.handle('store-get', (event, key) => {
      return store.get(key);
    });

    ipcMain.handle('store-set', (event, key, value) => {
      store.set(key, value);
      return true;
    });

    ipcMain.handle('store-delete', (event, key) => {
      store.delete(key);
      return true;
    });

    ipcMain.handle('store-clear', () => {
      store.clear();
      return true;
    });

    // Control de ventana
    ipcMain.handle('minimize-window', () => {
      this.mainWindow.minimize();
    });

    // Maximizar/restaurar ventana
    ipcMain.handle('maximize-window', () => {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.restore();
      } else {
        this.mainWindow.maximize();
      }
    });

    // Cerrar aplicación
    ipcMain.handle('close-app', () => {
      this.isQuitting = true;
      app.quit();
    });
  }

  // Configurar auto-updater
  setupAutoUpdater() {
    // Solo verificar actualizaciones en producción
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }

    autoUpdater.on('update-available', () => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Actualización disponible',
        message: 'Una nueva versión está disponible. Se descargará en segundo plano.',
        buttons: ['OK']
      });
    });

    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Actualización lista',
        message: 'La actualización se ha descargado. Se aplicará al reiniciar la aplicación.',
        buttons: ['Reiniciar', 'Más tarde']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  }

  // Inicializar aplicación
  async init() {
    await app.whenReady();
    
    console.log('🚀 Iniciando Farmacia GS Desktop');
    
    this.createSplashWindow();
    
    // Dar un poco de tiempo para que el splash se muestre
    setTimeout(() => {
      this.createMainWindow();
    }, 1000);
    
    this.createMenu();
    this.setupIPC();
    this.setupAutoUpdater();

    // Configurar eventos de la aplicación
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
  }
}

// Crear y ejecutar la aplicación
const farmaciaApp = new FarmaciaApp();
farmaciaApp.init().catch(console.error);
