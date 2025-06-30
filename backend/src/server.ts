import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno desde .env

import app from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDatabase(); // Conexión a la base de datos

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
};

startServer();
