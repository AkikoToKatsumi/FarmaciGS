import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import reportsRoutes from './routes/reports.routes';
import salesRoutes from './routes/sales.routes';
import clientsRoutes from './routes/clients.routes';
import rolesRoutes from './routes/roles.routes';
import providersRoutes from './routes/provider.routes';
import inventoryRoutes from './routes/inventory.routes'; // Descomentar si tienes rutas de inventario
import prescriptionRoutes from './routes/prescription.routes'; // Descomentar si tienes rutas de
import dashboardRoutes from './routes/dashboard.routes';
// recetas
import auditRoutes from './routes/audit.routes'; // Descomentar si tienes rutas de auditor

import usersRoutes from './routes/users.routes';
import employeesRoutes from './routes/employees.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/dashboard', dashboardRoutes);
// Rutas adicionales
 app.use('/api/inventory', inventoryRoutes); // Descomentar si tienes rutas de
// inventario
 app.use('/api/prescriptions', prescriptionRoutes); // Descomentar si tienes rutas
// de recetas 
app.use('/api/audit', auditRoutes); // Descomentar si tienes rutas de auditoría

 app.use('/api/users', usersRoutes);
 

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({ message: err.message || "Error interno del servidor" });
});

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
