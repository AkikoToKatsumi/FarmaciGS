"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const isDev = process.env.NODE_ENV === 'development';
class Application {
    constructor() {
        this.mainWindow = null;
        this.initializeApp();
    }
    initializeApp() {
        electron_1.app.whenReady().then(() => {
            this.createMainWindow();
            this.setupMenu();
            this.setupIpcHandlers();
        });
        electron_1.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                electron_1.app.quit();
            }
        });
        electron_1.app.on('activate', () => {
            if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow();
            }
        });
    }
    createMainWindow() {
        this.mainWindow = new electron_1.BrowserWindow({
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
        }
        else {
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
    setupMenu() {
        const template = [
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
                            const result = await electron_1.dialog.showSaveDialog(this.mainWindow, {
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
                            electron_1.app.quit();
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
                            electron_1.dialog.showMessageBox(this.mainWindow, {
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
                label: electron_1.app.getName(),
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
        const menu = electron_1.Menu.buildFromTemplate(template);
        electron_1.Menu.setApplicationMenu(menu);
    }
    setupIpcHandlers() {
        // Handle file operations
        electron_1.ipcMain.handle('show-save-dialog', async (event, options) => {
            const result = await electron_1.dialog.showSaveDialog(this.mainWindow, options);
            return result;
        });
        electron_1.ipcMain.handle('show-open-dialog', async (event, options) => {
            const result = await electron_1.dialog.showOpenDialog(this.mainWindow, options);
            return result;
        });
        // Handle notifications
        electron_1.ipcMain.handle('show-notification', (event, title, body) => {
            new Notification(title, { body });
        });
        // Handle app info
        electron_1.ipcMain.handle('get-app-version', () => {
            return electron_1.app.getVersion();
        });
        // Handle window operations
        electron_1.ipcMain.handle('minimize-window', () => {
            this.mainWindow?.minimize();
        });
        electron_1.ipcMain.handle('maximize-window', () => {
            if (this.mainWindow?.isMaximized()) {
                this.mainWindow.restore();
            }
            else {
                this.mainWindow?.maximize();
            }
        });
        electron_1.ipcMain.handle('close-window', () => {
            this.mainWindow?.close();
        });
    }
}
// Initialize the application
new Application();
