interface ElectronAPI {
  getConfig: () => Promise<any>;
  saveConfig: (config: any) => Promise<boolean>;
  testConnection: (serverUrl: string) => Promise<any>;
  showError: (title: string, message: string) => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeApp: () => Promise<void>;
  isElectron: boolean;
  platform: string;
  onUpdateAvailable: (callback: Function) => void;
  onUpdateDownloaded: (callback: Function) => void;
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
    clear: () => Promise<boolean>;
  };
  XLSX: {
    utils: {
      json_to_sheet: (data: any[]) => any;
      book_new: () => any;
      book_append_sheet: (workbook: any, worksheet: any, name?: string) => void;
      sheet_add_aoa: (worksheet: any, data: any[][], options?: any) => void;
    };
    writeFile: (workbook: any, filename: string) => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
