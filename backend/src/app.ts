// app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import inventoryRoutes from './routes/inventory.routes';
import salesRoutes from './routes/sales.routes';
import clientsRoutes from './routes/clients.routes';
import reportsRoutes from './routes/reports.routes';
import rolesRoutes from './routes/roles.routes';
import providersRoutes from './routes/provider.routes';
import prescriptionRoutes from './routes/prescription.routes';
import employeesRoutes from './routes/employees.routes';
import usersRoutes from './routes/users.routes';
import { verifyToken } from './middleware/auth.middleware'; // ✅ Importa el middleware correcto

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4004;

// Rutas principales de la API
app.use('/api/auth', authRoutes); // Sin middleware (para login/register)
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', verifyToken, salesRoutes); // ✅ CORRECTO: usa verifyToken
app.use('/api/clients', clientsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/provider', providersRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/users', usersRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;