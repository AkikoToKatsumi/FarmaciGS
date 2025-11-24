// src/services/ipc-api.ts
// Este servicio usa IPC para comunicarse con SQLite en lugar del backend HTTP

// Obtener ipcRenderer de forma segura
let ipcRenderer: any = null;

try {
  // En Electron con preload script
  if ((window as any).electronAPI?.db) {
    ipcRenderer = (window as any).electronAPI.db;
  } else {
    // Fallback para desarrollo
    const electron = require('electron');
    ipcRenderer = electron.ipcRenderer;
  }
} catch (e) {
  // No estamos en Electron
  console.warn('ipcRenderer no disponible');
}

// Verificar si estamos en Electron
const isElectron = () => {
  return ipcRenderer !== null;
};

// Interface para respuestas del API
interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// Funciones de utilidad para simular respuestas de API
const mockApiResponses = {
  // Dashboard stats
  getDashboardStats: () => ({
    totalSales: 15000,
    totalClients: 150,
    totalMedicines: 500,
    totalEmployees: 25,
    trendData: {
      semana: [1000, 1500, 1200, 1800, 2000, 1600, 1400],
      mes: [5000, 6000, 5500, 7000, 6500, 7500, 8000],
      año: [50000, 55000, 52000, 60000, 65000, 70000, 75000]
    }
  }),

  // Inventory stats
  getInventoryStats: () => ({
    totalInventory: 500,
    lowStockMedicines: 25,
    outOfStockMedicines: 5
  })
};

// Servicio IPC-API
export class IPCApiService {
  /**
   * Realiza una consulta SQL en SQLite mediante IPC
   */
  static async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      if (!isElectron()) {
        throw new Error('Esta funcionalidad solo está disponible en Electron');
      }

      let result;
      
      // Usar electronAPI si está disponible
      if ((window as any).electronAPI?.db?.query) {
        result = await (window as any).electronAPI.db.query(sql, params);
      } else if (ipcRenderer) {
        result = await ipcRenderer.query(sql, params);
      } else {
        throw new Error('No hay conexión IPC disponible');
      }

      return result as T[];
    } catch (error) {
      console.error('Error en consulta SQL:', error);
      throw error;
    }
  }

  /**
   * Realiza login usando SQLite
   */
  static async login(email: string, password: string) {
    try {
      if (!isElectron()) {
        throw new Error('Esta funcionalidad solo está disponible en Electron');
      }

      let result;

      // Usar electronAPI si está disponible
      if ((window as any).electronAPI?.db?.login) {
        result = await (window as any).electronAPI.db.login(email, password);
      } else if (ipcRenderer) {
        result = await ipcRenderer.login(email, password);
      } else {
        throw new Error('No hay conexión IPC disponible');
      }

      return result;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios
   */
  static async getUsers() {
    const sql = 'SELECT id, name, email, role_id, active FROM users ORDER BY name';
    return this.query(sql);
  }

  /**
   * Obtiene todos los clientes
   */
  static async getClients() {
    const sql = 'SELECT * FROM clients ORDER BY name';
    return this.query(sql);
  }

  /**
   * Obtiene todos los medicamentos
   */
  static async getMedicines() {
    const sql = 'SELECT * FROM medicines ORDER BY name';
    return this.query(sql);
  }

  /**
   * Obtiene todos los empleados
   */
  static async getEmployees() {
    const sql = 'SELECT * FROM employees ORDER BY name';
    return this.query(sql);
  }

  /**
   * Obtiene todas las ventas
   */
  static async getSales() {
    const sql = 'SELECT * FROM sales ORDER BY created_at DESC';
    return this.query(sql);
  }

  /**
   * Obtiene todos los roles
   */
  static async getRoles() {
    const sql = 'SELECT * FROM roles ORDER BY name';
    return this.query(sql);
  }

  /**
   * Obtiene todas las categorías
   */
  static async getCategories() {
    const sql = 'SELECT * FROM categories ORDER BY name';
    return this.query(sql);
  }

  /**
   * Obtiene cliente por ID
   */
  static async getClientById(id: number) {
    const sql = 'SELECT * FROM clients WHERE id = ?';
    const results = await this.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Obtiene medicamento por ID
   */
  static async getMedicineById(id: number) {
    const sql = 'SELECT * FROM medicines WHERE id = ?';
    const results = await this.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Obtiene medicamento por código de barras
   */
  static async getMedicineByBarcode(barcode: string) {
    const sql = 'SELECT * FROM medicines WHERE barcode = ?';
    const results = await this.query(sql, [barcode]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Obtiene prescripciones por cliente
   */
  static async getPrescriptionsByClient(clientId: number) {
    const sql = `
      SELECT p.*, GROUP_CONCAT(m.id) as medicine_ids
      FROM prescriptions p
      LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
      LEFT JOIN medicines m ON pi.medicine_id = m.id
      WHERE p.client_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    return this.query(sql, [clientId]);
  }

  /**
   * Crea una venta
   */
  static async createSale(data: any) {
    const { clientId, employeeId, total, items } = data;
    
    const sql = `
      INSERT INTO sales (client_id, employee_id, total, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    
    const result = await this.query(sql, [clientId, employeeId, total]);
    return result;
  }

  /**
   * Crea un cliente
   */
  static async createClient(data: any) {
    const { name, email, phone, rnc, address, city } = data;
    
    const sql = `
      INSERT INTO clients (name, email, phone, rnc, address, city, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    return this.query(sql, [name, email, phone, rnc, address, city]);
  }

  /**
   * Obtiene estadísticas del dashboard
   */
  static async getDashboardStats() {
    try {
      const totalSales = await this.query('SELECT COUNT(*) as count FROM sales');
      const totalClients = await this.query('SELECT COUNT(*) as count FROM clients');
      const totalMedicines = await this.query('SELECT COUNT(*) as count FROM medicines');
      const totalEmployees = await this.query('SELECT COUNT(*) as count FROM employees');

      return {
        totalSales: totalSales[0]?.count || 0,
        totalClients: totalClients[0]?.count || 0,
        totalMedicines: totalMedicines[0]?.count || 0,
        totalEmployees: totalEmployees[0]?.count || 0
      };
    } catch (error) {
      console.warn('Error obteniendo stats, usando valores por defecto');
      return mockApiResponses.getDashboardStats();
    }
  }
}

export default IPCApiService;
