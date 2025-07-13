"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
// Exportamos una función de orden superior 'authorizeRoles' que crea un middleware de autorización.
// Acepta una lista de roles permitidos como argumentos.
const authorizeRoles = (...allowedRoles) => {
    // Devolvemos la función middleware.
    return (req, res, next) => {
        // Obtenemos el rol del usuario desde el objeto 'req.user' que fue añadido por el middleware 'verifyToken'.
        const role = req.user?.role;
        // Verificamos si el rol del usuario NO está incluido en la lista de roles permitidos.
        if (!allowedRoles.includes(role)) {
            // Si el rol no está permitido, devolvemos un error 403 (Prohibido).
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        // Si el rol del usuario está en la lista de permitidos, pasamos al siguiente middleware o controlador.
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
