"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
// Importamos la librería jsonwebtoken para trabajar con JWT.
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Exportamos el middleware 'verifyToken' para proteger nuestras rutas.
const verifyToken = (req, res, next) => {
    // Obtenemos el encabezado 'Authorization' de la solicitud.
    const authHeader = req.header('Authorization');
    // Si no existe el encabezado, significa que no se proporcionó un token.
    if (!authHeader) {
        // Devolvemos un error 401 (No autorizado) indicando que falta el token.
        return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
    }
    // Extraemos el token del encabezado. Soportamos el formato "Bearer <token>" y también solo el token.
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1] // Si empieza con "Bearer ", tomamos la segunda parte.
        : authHeader; // Si no, asumimos que todo el encabezado es el token.
    // Usamos un bloque try...catch para manejar errores en la verificación del token (ej. si es inválido o ha expirado).
    try {
        // Verificamos el token usando el secreto guardado en nuestras variables de entorno.
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Si el token es válido, adjuntamos la información decodificada (payload) a la solicitud (req.user).
        req.user = decoded;
        // Llamamos a next() para pasar el control al siguiente middleware o al controlador.
        next();
    }
    catch (error) {
        // Si jwt.verify lanza un error, significa que el token no es válido.
        // Devolvemos un error 401 (No autorizado).
        res.status(401).json({ message: 'Token inválido.' });
    }
};
exports.verifyToken = verifyToken;
