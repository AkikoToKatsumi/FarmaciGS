"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
// Exportamos una función de orden superior 'validateBody' que crea un middleware de validación.
// Acepta un esquema de Zod como argumento.
const validateBody = (schema) => {
    // Devolvemos la función middleware.
    return (req, res, next) => {
        // Usamos 'safeParse' de Zod para validar el cuerpo (body) de la solicitud contra el esquema.
        // 'safeParse' no lanza errores, sino que devuelve un objeto con el resultado.
        const result = schema.safeParse(req.body);
        // Si la validación no fue exitosa...
        if (!result.success) {
            // Devolvemos un error 400 (Solicitud incorrecta) con los detalles del error formateados por Zod.
            return res.status(400).json({ errors: result.error.format() });
        }
        // Si la validación es exitosa, Zod puede haber transformado o limpiado los datos.
        // Reemplazamos req.body con los datos validados y limpios (result.data).
        req.body = result.data;
        // Pasamos el control al siguiente middleware o al controlador.
        next();
    };
};
exports.validateBody = validateBody;
