// Importa Router, Request y Response de Express para definir rutas y tipos
import { Router, Request, Response } from 'express';
// Importa los controladores de ventas
import { createSale, getAllSales, getSaleById, exportSalesToCSV } from '../controllers/sales.controller';
// Importa el middleware para verificar el token JWT
import { verifyToken } from '../middleware/auth.middleware';

// Crea una nueva instancia de Router
const router = Router();

// Ruta para crear una venta (requiere autenticación)
// Se hace un type assertion para evitar errores de tipos con AuthRequest
router.post('/sales', verifyToken, createSale as unknown as (req: Request, res: Response) => any);
// Ruta para obtener todas las ventas (requiere autenticación)
router.get('/', verifyToken, getAllSales);
// Ruta para obtener una venta por ID (requiere autenticación)
// Se hace un type assertion para evitar errores de tipos con AuthRequest
router.get('/:id', verifyToken, getSaleById as unknown as (req: Request, res: Response) => any);
// Ruta para exportar ventas a CSV (requiere autenticación)
router.get('/export/csv', verifyToken, exportSalesToCSV);

// Exporta el router para ser usado en la aplicación principal
export default router;
