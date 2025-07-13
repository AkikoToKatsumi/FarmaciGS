"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
// c:\Farmacia GS\backend\src\config\email.ts
// Importamos la librería nodemailer, que nos permite enviar correos electrónicos desde Node.js.
const nodemailer_1 = __importDefault(require("nodemailer"));
// Exportamos una instancia de 'transporter' de nodemailer.
// Un 'transporter' es un objeto que puede enviar correos.
exports.transporter = nodemailer_1.default.createTransport({
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
