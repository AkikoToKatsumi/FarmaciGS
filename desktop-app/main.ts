import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import * as path from 'path';


const isDev = process.env.NODE_ENV === 'development';

class Application {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupMenu();
      this.setupIpcHandlers();
    });

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

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true
      },
      titleBarStyle: 'default',
      show: false,
      icon: path.join(__dirname, '../assets/icon.png')
    });

    // Load the app
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools(); // para depurar errores en React
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Archivo',
        submenu: [
          {
            label: 'Nueva Venta',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/sales/new');
            }
          },
          { type: 'separator' },
          {
            label: 'Exportar Datos',
            click: async () => {
              const result = await dialog.showSaveDialog(this.mainWindow!, {
                filters: [
                  { name: 'JSON', extensions: ['json'] },
                  { name: 'CSV', extensions: ['csv'] }
                ]
              });
              
              if (!result.canceled) {
                this.mainWindow?.webContents.send('export-data', result.filePath);
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Salir',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Inventario',
        submenu: [
          {
            label: 'Ver Inventario',
            accelerator: 'CmdOrCtrl+I',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/inventory');
            }
          },
          {
            label: 'Agregar Medicina',
            accelerator: 'CmdOrCtrl+M',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/inventory/new');
            }
          },
          {
            label: 'Stock Bajo',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/inventory/low-stock');
            }
          }
        ]
      },
      {
        label: 'Ventas',
        submenu: [
          {
            label: 'Ver Ventas',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/sales');
            }
          },
          {
            label: 'Reportes',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/reports');
            }
          }
        ]
      },
      {
        label: 'Clientes',
        submenu: [
          {
            label: 'Ver Clientes',
            accelerator: 'CmdOrCtrl+C',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/clients');
            }
          },
          {
            label: 'Agregar Cliente',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/clients/new');
            }
          }
        ]
      },
      {
        label: 'Ver',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Ventana',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        label: 'Ayuda',
        submenu: [
          {
            label: 'Acerca de',
            click: () => {
              dialog.showMessageBox(this.mainWindow!, {
                type: 'info',
                title: 'Sistema de Farmacia',
                message: 'Sistema de Gestión de Farmacias v1.0.0',
                detail: 'Desarrollado con Electron, React y TypeScript'
              });
            }
          }
        ]
      }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIpcHandlers(): void {
    // Handle file operations
    ipcMain.handle('show-save-dialog', async (event, options) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, options);
      return result;
    });

    ipcMain.handle('show-open-dialog', async (event, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, options);
      return result;
    });

    // Handle notifications
    ipcMain.handle('show-notification', (event, title: string, body: string) => {
      new Notification(title, { body });
    });

    // Handle app info
    ipcMain.handle('get-app-version', () => {
      return app.getVersion();
    });

    // Handle window operations
    ipcMain.handle('minimize-window', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('maximize-window', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.restore();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('close-window', () => {
      this.mainWindow?.close();
    });
  }
}

// Initialize the application
new Application();