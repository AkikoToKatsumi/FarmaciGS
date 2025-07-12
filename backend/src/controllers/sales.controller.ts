// c:\Farmacia GS\backend\src\controllers\sales.controller.ts
// Importamos los tipos Request y Response de Express para manejar las peticiones y respuestas HTTP.
import { Request, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos.
import pool from '../config/db';

// Exportamos la función asíncrona para obtener todas las ventas.
export const getSales = async (_req: Request, res: Response) => {
  // Usamos un bloque try...catch para manejar cualquier error que pueda ocurrir durante la consulta.
  try {
    // Ejecutamos una consulta SQL para seleccionar todas las ventas, ordenadas por fecha de creación descendente.
    const result = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    // Si la consulta es exitosa, respondemos con un estado 200 (OK) y los datos de las ventas en formato JSON.
    res.status(200).json(result.rows);
  } catch (error) {
    // Si ocurre un error, lo registramos en la consola para depuración.
    console.error("❌ Error al obtener ventas:", error);
    // Y enviamos una respuesta de error 500 (Error Interno del Servidor) al cliente.
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
};

// Exportamos la función asíncrona para crear una nueva venta.
export const createSale = async (req: Request, res: Response) => {
  // Extraemos el ID del cliente y el monto total del cuerpo (body) de la solicitud.
  const { client_id, total_amount } = req.body;
  // Usamos un bloque try...catch para un manejo de errores robusto.
  try {
    // Ejecutamos una consulta SQL para insertar una nueva venta en la base de datos.
    // Usamos 'RETURNING *' para que la base de datos nos devuelva el registro completo que acabamos de crear.
    const result = await pool.query(
      'INSERT INTO sales (client_id, total_amount) VALUES ($1, $2) RETURNING *',
      [client_id, total_amount]
    );
    // Si la creación es exitosa, respondemos con un estado 201 (Created) y los datos de la nueva venta.
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Si algo sale mal, lo registramos en la consola.
    console.error("❌ Error al crear venta:", error);
    // Y devolvemos un error 500 al cliente.
    res.status(500).json({ message: 'Error al crear venta' });
  }
};

// Exportamos una función para obtener una venta por su ID.
// Nota: Esta función está definida pero aún no tiene una implementación. Lanza un error si se llama.
export function getSaleById(arg0: string, getSaleById: any) {
    throw new Error('Function not implemented.');
}

// Exportamos una función para actualizar una venta.
// Nota: Esta función está definida pero aún no tiene una implementación. Lanza un error si se llama.
export function updateSale(arg0: string, updateSale: any) {
    throw new Error('Function not implemented.');
}

// Exportamos una función para eliminar una venta.
// Nota: Esta función está definida pero aún no tiene una implementación. Lanza un error si se llama.
export function deleteSale(arg0: string, deleteSale: any) {
    throw new Error('Function not implemented.');
}
