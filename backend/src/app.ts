// Importa express para crear la aplicación
import express from 'express';
// Importa cors para permitir peticiones de diferentes orígenes
import cors from 'cors';
// Importa dotenv para cargar variables de entorno desde .env
import dotenv from 'dotenv';
// Importa las rutas de autenticación
import authRoutes from './routes/auth.routes';
// Importa las rutas de inventario
import inventoryRoutes from './routes/inventory.routes';
// Importa las rutas de ventas
import salesRoutes from './routes/sales.routes';
// Importa las rutas de clientes
import clientsRoutes from './routes/clients.routes';
// Importa las rutas de reportes
import reportsRoutes from './routes/reports.routes';
// Importa las rutas de roles
import rolesRoutes from './routes/roles.routes';
// Importa las rutas de proveedores
import providersRoutes from './routes/provider.routes';
import prescriptionRoutes from './routes/prescription.routes';



// Carga las variables de entorno
dotenv.config();

// Crea la instancia principal de la aplicación Express
const app = express();
// Habilita CORS para todas las rutas // Middlewares
app.use(cors());
app.use(express.json());
// Permite recibir y procesar JSON en las peticiones
app.use(express.json());
const PORT = process.env.PORT || 4004;

// Rutas principales de la API

app.use('/api/auth', authRoutes); // Rutas de autenticación

app.use('/api/inventory', inventoryRoutes); // Rutas de inventario
app.use('/api/sales', salesRoutes); // Rutas de ventas
app.use('/api/clients', clientsRoutes); // Rutas de clientes
app.use('/api/reports', reportsRoutes); // Rutas de reportes
app.use('/api/roles', rolesRoutes); // Rutas de roles
app.use('/api/provider', providersRoutes); // Rutas de proveedores
app.use('/api/prescriptions', prescriptionRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Exporta la app para ser utilizada en el archivo principal (server)
export default app;
