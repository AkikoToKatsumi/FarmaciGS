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
import categoryRoutes from './routes/category.routes';

dotenv.config();

const app = express();

// Cambia la configuración de CORS para aceptar el origen del frontend
app.use(cors({
  origin: 'http://localhost:5173', // <-- origen del frontend Vite
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Logging middleware para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/dashboard', dashboardRoutes);
// Rutas adicionales
app.use('/api/inventory', inventoryRoutes);
app.use('/api/prescriptions', prescriptionRoutes); // Descomentar si tienes rutas
// de recetas 
app.use('/api/audit', auditRoutes); // Descomentar si tienes rutas de auditoría
app.use('/api/categories', categoryRoutes); // Asegurar que esta línea esté presente

app.use('/api/users', usersRoutes);

// Ruta de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({ message: err.message || "Error interno del servidor" });
});

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Rutas montadas:`);
  console.log(`- /api/auth`);
  console.log(`- /api/reports`);
  console.log(`- /api/sales`);
  console.log(`- /api/employees`);
  console.log(`- /api/clients`);
  console.log(`- /api/roles`);
  console.log(`- /api/providers`);
  console.log(`- /api/dashboard`);
  console.log(`- /api/inventory`);
  console.log(`- /api/prescriptions`);
  console.log(`- /api/audit`);
  console.log(`- /api/categories`);
  console.log(`- /api/users`);
});

export default app;

