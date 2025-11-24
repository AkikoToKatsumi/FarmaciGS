const { app, BrowserWindow, Menu, ipcMain, dialog, shell, protocol } = require('electron');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const log = require('electron-log');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const Database = require('better-sqlite3');

// Configurar logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Configuraciones para mejorar rendimiento y reducir errores
app.commandLine.appendSwitch('--disable-gpu');
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--ignore-gpu-blacklist');
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-features=VizDisplayCompositor');
app.commandLine.appendSwitch('--disable-dev-shm-usage');

// En Windows, configuraciones adicionales
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('--disable-gpu-process-crash-limit');
  app.commandLine.appendSwitch('--disable-background-timer-throttling');
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
    this.backendProcess = null;
    this.dbProcess = null;
    this.dbPort = 5433; // Puerto para DB embebida (diferente al default 5432 para evitar conflictos)
  }

  // Iniciar base de datos PostgreSQL local
  async startDatabase() {
    console.log('🐘 Iniciando base de datos PostgreSQL local...');
    
    let pgBinDir = null;
    let pgDataDir = null;

    if (app.isPackaged) {
      pgBinDir = path.join(process.resourcesPath, 'pgsql', 'bin');
      pgDataDir = path.join(app.getPath('userData'), 'pgdata');
    } else {
      pgBinDir = path.join(__dirname, '..', 'pgsql', 'bin');
      pgDataDir = path.join(__dirname, '..', 'pgsql', 'data');
    }

    const pgCtl = path.join(pgBinDir, 'pg_ctl.exe');
    const initDb = path.join(pgBinDir, 'initdb.exe');

    console.log('📁 PG Bin:', pgBinDir);
    console.log('📁 PG Data:', pgDataDir);

    if (!fs.existsSync(pgCtl)) {
      console.warn('⚠️ No se encontró PostgreSQL local. Se asumirá base de datos externa.');
      return false;
    }

    // Si estamos empaquetados y no existe data dir en userData, necesitamos inicializarlo o copiarlo
    if (app.isPackaged && !fs.existsSync(pgDataDir)) {
      console.log('⚙️ Inicializando directorio de datos en usuario...');
      
      // Opción A: Copiar una plantilla pre-inicializada (mejor performance)
      const sourceDataDir = path.join(process.resourcesPath, 'pgsql', 'data');
      if (fs.existsSync(sourceDataDir)) {
         try {
             // Copia recursiva simple (Node 16+)
             fs.cpSync(sourceDataDir, pgDataDir, { recursive: true });
             console.log('✅ Datos copiados exitosamente.');
         } catch (err) {
             console.error('❌ Error copiando datos:', err);
         }
      } else {
         // Opción B: Inicializar desde cero (si tenemos initdb)
         console.log('⚙️ Creando nueva DB...');
         try {
            execSync(`"${initDb}" -D "${pgDataDir}" -U postgres -A trust -E UTF8`);
         } catch (e) {
            console.error('❌ Error initdb:', e);
         }
      }
    }

    // Arrancar PostgreSQL
    try {
      console.log('🚀 Ejecutando pg_ctl start...');
      // Usamos spawn para mantener el control o exec para comando simple
      // pg_ctl start corre en background por defecto, así que exec está bien, 
      // pero necesitamos asegurarnos de matarlo al salir.
      
      // -o "-p 5433" para cambiar el puerto
      const command = `"${pgCtl}" -D "${pgDataDir}" -o "-p ${this.dbPort}" -l "${path.join(pgDataDir, 'logfile')}" start`;
      console.log('Comando:', command);
      
      execSync(command);
      console.log('✅ PostgreSQL iniciado correctamente.');
      this.dbProcess = true; // Marcador para saber que debemos detenerlo
      return true;
    } catch (error) {
      console.error('❌ Error iniciando PostgreSQL:', error.message);
      // Puede que ya esté corriendo
      return false;
    }
  }

  stopDatabase() {
    if (this.dbProcess) {
      console.log('🛑 Deteniendo PostgreSQL...');
      let pgBinDir = null;
      let pgDataDir = null;

      if (app.isPackaged) {
        pgBinDir = path.join(process.resourcesPath, 'pgsql', 'bin');
        pgDataDir = path.join(app.getPath('userData'), 'pgdata');
      } else {
        pgBinDir = path.join(__dirname, '..', 'pgsql', 'bin');
        pgDataDir = path.join(__dirname, '..', 'pgsql', 'data');
      }

      const pgCtl = path.join(pgBinDir, 'pg_ctl.exe');
      
      try {
        execSync(`"${pgCtl}" -D "${pgDataDir}" stop`);
        console.log('✅ PostgreSQL detenido.');
      } catch (e) {
        console.error('Error deteniendo DB:', e.message);
      }
    }
  }

  // Iniciar servidor backend
  async startBackendServer() {
    try {
      console.log('🚀 Iniciando servidor backend...');
      
      // Determinar ruta del backend
      let backendPath = null;
      
      if (app.isPackaged) {
        // En instalador, buscar en resources/backend/dist
        backendPath = path.join(process.resourcesPath, 'backend', 'dist', 'server.js');
        console.log('📁 Backend empaquetado en:', backendPath);
      } else {
        // En desarrollo
        backendPath = path.join(__dirname, '..', '..', 'backend', 'dist', 'server.js');
        console.log('📁 Backend en desarrollo en:', backendPath);
      }

      console.log('📁 Ruta backend:', backendPath);
      
      if (!backendPath || !fs.existsSync(backendPath)) {
        console.warn('⚠️ Backend no encontrado en:', backendPath);
        console.warn('⚠️ Continuando sin backend local...');
        return false;
      }

      // Configurar variables de entorno
      const env = {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '4004',
        DB_HOST: 'localhost',
        DB_PORT: this.dbPort.toString(), // Usar el puerto de nuestra DB embebida
        DB_USER: 'farmacia_user',
        DB_PASSWORD: 'password_seguro',
        DB_NAME: 'farmaciagsdb',
        JWT_SECRET: 'jwt_secret_super_seguro_256_bits'
      };

      // Iniciar proceso del backend
      const backendDir = path.dirname(backendPath);
      console.log('📁 Backend working directory:', backendDir);
      
      this.backendProcess = spawn('node', [backendPath], {
        cwd: backendDir,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true  // Necesario en Windows
      });

      // Capturar salida del backend
      this.backendProcess.stdout.on('data', (data) => {
        console.log(`[BACKEND] ${data.toString().trim()}`);
      });

      this.backendProcess.stderr.on('data', (data) => {
        console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
      });

      this.backendProcess.on('error', (err) => {
        console.error('❌ Error iniciando backend:', err.message);
      });

      this.backendProcess.on('exit', (code) => {
        console.warn(`⚠️ Proceso backend terminó con código ${code}`);
        this.backendProcess = null;
      });

      // Esperar a que el servidor esté listo
      const backendReady = await this.waitForServer('http://localhost:4004', 15000);
      if (backendReady) {
        console.log('✅ Servidor backend iniciado correctamente');
      } else {
        console.warn('⚠️ Servidor no respondió. Continuando sin backend...');
      }
      return backendReady;
    } catch (error) {
      console.error('❌ Error en startBackendServer:', error.message);
      console.error(error);
      return false;
    }
  }

  // Esperar a que el servidor esté listo
  async waitForServer(url, timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const http = require('http');
        await new Promise((resolve, reject) => {
          const req = http.get(url, { timeout: 1000 }, (res) => {
            resolve(true);
          });
          req.on('error', () => {
            resolve(false);
          });
          req.on('timeout', () => {
            req.abort();
            resolve(false);
          });
        });
        return true;
      } catch (e) {
        // Servidor aún no está listo
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.warn('⚠️ Timeout esperando backend en 10s');
    return false;
  }

  // Detener servidor backend
  stopBackendServer() {
    if (this.backendProcess) {
      console.log('🛑 Deteniendo servidor backend...');
      try {
        this.backendProcess.kill('SIGTERM');
        setTimeout(() => {
          if (this.backendProcess && !this.backendProcess.killed) {
            this.backendProcess.kill('SIGKILL');
          }
        }, 5000);
      } catch (e) {
        console.error('Error deteniendo backend:', e.message);
      }
    }
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
        webSecurity: false, // Necesario para desarrollo local
        allowRunningInsecureContent: false
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
    console.log('📁 Verificando archivo existe:', fs.existsSync(indexPath));
    
    this.mainWindow.loadFile(indexPath).catch((error) => {
      console.error('❌ Error cargando aplicación:', error);
    });

    // Configurar eventos
    this.setupMainWindowEvents();
    
    // Debugging: logs de eventos importantes
    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('✅ Aplicación cargada exitosamente');
      this.mainWindow.show();
    });

    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('❌ Error al cargar página:', errorCode, errorDescription);
    });

    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('🎯 DOM está listo');
    });

    // Mostrar herramientas de desarrollo en modo desarrollo
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
    
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
      icon: path.join(__dirname, '../public/imagenes/logo.png')
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
        webSecurity: false, // Permitir carga de archivos locales
        allowRunningInsecureContent: true
      },
      icon: path.join(__dirname, '../public/imagenes/logo.png'),
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
    // Configurar protocolo personalizado para assets
    protocol.registerSchemesAsPrivileged([
      { 
        scheme: 'farmacia-assets', 
        privileges: { 
          secure: true, 
          standard: true, 
          supportFetchAPI: true,
          corsEnabled: true
        } 
      }
    ]);

    await app.whenReady();
    
    // Registrar protocolo personalizado para assets
    protocol.registerFileProtocol('farmacia-assets', (request, callback) => {
      const url = request.url.replace('farmacia-assets://', '');
      const assetPath = path.join(__dirname, '../dist', url);
      
      console.log(`🖼️ Solicitando asset: ${url}`);
      console.log(`📁 Ruta completa: ${assetPath}`);
      
      if (fs.existsSync(assetPath)) {
        callback({ path: assetPath });
      } else {
        console.error(`❌ Asset no encontrado: ${assetPath}`);
        callback({ error: -6 }); // FILE_NOT_FOUND
      }
    });
    
    console.log('🚀 Iniciando Farmacia GS Desktop');
    
    // Iniciar DB
    await this.startDatabase();

    // Configurar IPC handlers primero (antes de que la ventana intente usarlos)
    this.setupIPC();
    
    // Iniciar servidor backend
    await this.startBackendServer();
    
    this.createSplashWindow();
    
    // Dar un poco de tiempo para que el splash se muestre
    setTimeout(() => {
      this.createMainWindow();
    }, 1000);
    
    this.createMenu();
    this.setupAutoUpdater();

    // Configurar eventos de la aplicación
    app.on('window-all-closed', () => {
      this.stopBackendServer();
      this.stopDatabase();
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
    
    // Asegurar limpieza al salir
    app.on('will-quit', () => {
        this.stopBackendServer();
        this.stopDatabase();
    });
  }
}

// Crear y ejecutar la aplicación
const farmaciaApp = new FarmaciaApp();
farmaciaApp.init().catch(console.error);
