// Importa Router de Express para definir rutas
import { Router } from 'express';
// Importa los controladores de reportes
import * as reportsController from '../controllers/reports.controller';
// Corrige la importación del middleware:
import { verifyToken } from '../middleware/auth.middleware';
import express from 'express';
import path from 'path';

// Crea una nueva instancia de Router
const router = Router();

// Ruta para obtener el reporte de ventas (solo Administrador y Supervisor)
router.get('/ventas', verifyToken, reportsController.getSalesReport);
// Ruta para obtener medicamentos próximos a vencer (solo Administrador y Supervisor)
router.get('/vencimientos', verifyToken, reportsController.getExpiringMedicines);
// Ruta para obtener medicamentos con bajo stock (solo Administrador y Supervisor)
router.get('/bajo-stock', verifyToken, reportsController.getLowStock);

// Backup y restauración
// Para evitar el error de tipos, usa una función wrapper que adapte el tipo de req:
router.post('/backup', verifyToken, (req, res) => {
  // @ts-ignore
  reportsController.backupDatabase(req, res);
});
router.get('/backups', verifyToken, reportsController.listBackups);
router.delete('/backups/:filename', verifyToken, reportsController.deleteBackup);

// Exporta el router para ser usado en la aplicación principal
export default router;

// Para servir archivos estáticos de backups (esto debe ir en tu archivo principal de app, no en routes)
// app.use('/backups', express.static(path.join(__dirname, '..', '..', 'backups')));
