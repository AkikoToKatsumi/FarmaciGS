// c:\Farmacia GS\backend\src\config\email.ts
// Importamos la librería nodemailer, que nos permite enviar correos electrónicos desde Node.js.
import nodemailer from 'nodemailer';

// Exportamos una instancia de 'transporter' de nodemailer.
// Un 'transporter' es un objeto que puede enviar correos.
export const transporter = nodemailer.createTransport({
  // Configuramos el servicio de correo que vamos a utilizar, en este caso 'gmail'.
  service: 'gmail',
  // Configuramos la autenticación para nuestra cuenta de correo.
  auth: {
    // El usuario (correo electrónico) se obtiene de las variables de entorno.
    user: process.env.EMAIL_USER,
    // La contraseña (o contraseña de aplicación) también se obtiene de las variables de entorno.
    pass: process.env.EMAIL_PASS,
  },
});
