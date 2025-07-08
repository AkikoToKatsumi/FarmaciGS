// c:\Farmacia GS\backend\src\controllers\reports.controller.ts
// Importamos los tipos Request y Response de Express para manejar las peticiones y respuestas HTTP.
import { Request, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos.
import pool from '../config/db';
// Importamos nuestro servicio de copias de seguridad para manejar la lógica relacionada.
import { backupService } from '../services/backup.service';

// Definimos un tipo personalizado para las solicitudes autenticadas, extendiendo Request para incluir la información del usuario.
type AuthRequest = Request & { user: { id: number } };

// Exportamos la función asíncrona para obtener el reporte de ventas.
export const getSalesReport = async (req: Request, res: Response) => {
  // Extraemos las fechas 'from' (desde) y 'to' (hasta) de los parámetros de la consulta (query) en la URL.
  const { from, to } = req.query;
  // Ejecutamos una consulta para seleccionar las ventas dentro del rango de fechas especificado.
  const result = await pool.query(
    'SELECT * FROM sales WHERE created_at >= $1 AND created_at <= ',
    [from, to]
  );
  // Devolvemos los resultados en formato JSON.
  res.json(result.rows);
};

// Exportamos la función para obtener el reporte de medicamentos con bajo stock.
export const getLowStock = async (_req: Request, res: Response) => {
  // Ejecutamos una consulta para encontrar todos los medicamentos cuyo stock sea menor a 10.
  const result = await pool.query('SELECT * FROM medicines WHERE stock < 10');
  // Devolvemos los resultados en formato JSON.
  res.json(result.rows);
};

// Exportamos la función para obtener el reporte de medicamentos próximos a expirar.
export const getExpiringMedicines = async (_: Request, res: Response) => {
  // Obtenemos la fecha y hora actual.
  const now = new Date();
  // Calculamos la fecha de "pronto", que será un mes a partir de ahora.
  const soon = new Date();
  soon.setMonth(soon.getMonth() + 1);
  // Ejecutamos una consulta para encontrar los medicamentos que expiran entre hoy y el próximo mes.
  const result = await pool.query(
    'SELECT * FROM medicines WHERE expiration_date >=  AND expiration_date <= ',
    [now, soon]
  );
  // Devolvemos los resultados en formato JSON.
  res.json(result.rows);
};

// Exportamos la función para crear una copia de seguridad de la base de datos.
export const backupDatabase = async (req: AuthRequest, res: Response) => {
  // Usamos un bloque try...catch para manejar posibles errores durante el proceso.
  try {
    // Llamamos a nuestro servicio para crear la copia de seguridad, pasando el ID del usuario que realiza la acción.
    const backup = await backupService.createBackup(req.user.id);
    // Devolvemos la información de la copia de seguridad creada.
    res.json(backup);
  } catch (error: any) {
    // Si hay un error, respondemos con un estado 500 y el mensaje de error.
    res.status(500).json({ message: error.message });
  }
};

// Exportamos la función para listar todas las copias de seguridad existentes.
export const listBackups = async (_req: Request, res: Response) => {
  // Usamos un bloque try...catch para manejar posibles errores.
  try {
    // Llamamos a nuestro servicio para obtener la lista de copias de seguridad.
    const backups = await backupService.listBackups();
    // Devolvemos la lista en formato JSON.
    res.json(backups);
  } catch (error: any) {
    // Si hay un error, respondemos con un estado 500 y el mensaje de error.
    res.status(500).json({ message: error.message });
  }
};

// Exportamos la función para eliminar una copia de seguridad específica.
export const deleteBackup = async (req: Request, res: Response) => {
  // Usamos un bloque try...catch para manejar posibles errores.
  try {
    // Obtenemos el nombre del archivo a eliminar de los parámetros de la URL.
    const filename = req.params.filename;
    // Llamamos a nuestro servicio para eliminar el archivo, pasando el nombre y el ID del usuario (si existe).
    await backupService.deleteBackup(filename, (req as any).user?.id);
    // Respondemos con un mensaje de éxito.
    res.json({ success: true });
  } catch (error: any) {
    // Si hay un error, respondemos con un estado 500 y el mensaje de error.
    res.status(500).json({ message: error.message });
  }
};
