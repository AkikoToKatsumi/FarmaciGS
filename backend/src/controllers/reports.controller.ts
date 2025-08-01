// c:\Farmacia GS\backend\src\controllers\reports.controller.ts
// Importamos los tipos Request y Response de Express para manejar las peticiones y respuestas HTTP.
import moment from 'moment';
import { Request, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos.
import pool from '../config/db';
// Importamos nuestro servicio de copias de seguridad para manejar la lógica relacionada.
import { backupService } from '../services/backup.service';

// Definimos un tipo personalizado para las solicitudes autenticadas, extendiendo Request para incluir la información del usuario.
type AuthRequest = Request & { user: { id: number } };

// Exportamos la función asíncrona para obtener el reporte de ventas.
export const getSalesReport = async (req: Request, res: Response) => {
   console.log('GET /api/reports/sales llamado con:', req.query);
  try {
    const from = moment(req.query.from as string).startOf('day').toISOString();
    const to = moment(req.query.to as string).endOf('day').toISOString();

    const query = `
      SELECT s.id, s.sale_date, s.total, u.username as seller
      FROM sales s
      JOIN users u ON s.user_id = u.id
      WHERE s.sale_date BETWEEN $1 AND $2
      ORDER BY s.sale_date DESC
    `;
    const result = await pool.query(query, [from, to]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener reporte de ventas:', error);
    res.status(500).json({ message: 'Error al obtener el reporte de ventas' });
  }
};
// Exportamos la función para obtener el reporte de medicamentos con bajo stock.
export const getLowStock = async (_req: Request, res: Response) => {
  // Ejecutamos una consulta para encontrar todos los medicamentos cuyo stock sea menor a 10.
  const result = await pool.query('SELECT * FROM medicine WHERE stock < 10');
  // Devolvemos los resultados en formato JSON.
  res.json(result.rows);
};

// Exportamos la función para obtener el reporte de medicamentos próximos a expirar.
export const getExpiringMedicine = async (_: Request, res: Response) => {
  // Obtenemos la fecha y hora actual.
  const now = new Date();
  // Calculamos la fecha de "pronto", que será un mes a partir de ahora.
  const soon = new Date();
  soon.setMonth(soon.getMonth() + 1);
  // Ejecutamos una consulta para encontrar los medicamentos que expiran entre hoy y el próximo mes.
  const result = await pool.query(
    'SELECT * FROM medicine WHERE expiration_date >= $1 AND expiration_date <= $2',
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
