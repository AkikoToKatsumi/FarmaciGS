import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import salesRoutes from './routes/sales.routes';
import clientsRoutes from './routes/clients.routes';
import rolesRoutes from './routes/roles.routes';
import providersRoutes from './routes/provider.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/providers', providersRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
