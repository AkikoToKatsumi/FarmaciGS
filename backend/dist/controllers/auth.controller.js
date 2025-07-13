"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
// Importamos la librería jsonwebtoken para crear y verificar tokens de autenticación.
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Importamos bcryptjs para comparar contraseñas hasheadas de forma segura.
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Importamos nuestro pool de conexiones a la base de datos PostgreSQL.
const db_1 = __importDefault(require("../config/db"));
// Exportamos la función asíncrona 'login' que manejará el inicio de sesión de los usuarios.
const login = async (req, res) => {
    // Usamos un bloque try...catch para manejar posibles errores durante el proceso.
    try {
        // Extraemos el email y la contraseña del cuerpo (body) de la solicitud.
        const { email, password } = req.body;
        // 🔍 LOGS PARA DEBUGGING - Estos logs nos ayudan a ver qué datos llegan y el estado de las variables.
        console.log('Body recibido:', req.body);
        console.log('Email:', email);
        console.log('Password length:', password?.length);
        console.log('JWT_SECRET definido:', !!process.env.JWT_SECRET);
        // Validamos que el email y la contraseña no estén vacíos.
        if (!email || !password) {
            // Si faltan datos, devolvemos un error 400 (Bad Request).
            return res.status(400).json({ message: 'Email y contraseña son requeridos' });
        }
        // Más logs para seguir el flujo de la consulta a la base de datos.
        console.log('🔍 Ejecutando consulta SQL...');
        console.log('Query:', 'SELECT * FROM users WHERE email = $1');
        console.log('Parámetros:', [email]);
        // Ejecutamos una consulta a la base de datos para encontrar un usuario con el email proporcionado.
        const result = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        // Logs para ver el resultado de la consulta.
        console.log('🔍 Resultado de la consulta:');
        console.log('Filas encontradas:', result.rows.length);
        console.log('Datos completos:', result.rows);
        // Obtenemos el primer usuario encontrado en el resultado.
        const user = result.rows[0];
        // Verificamos si el usuario existe.
        console.log('Usuario encontrado:', user ? 'Sí' : 'No');
        // Si no se encuentra ningún usuario, devolvemos un error 401 (Unauthorized).
        if (!user) {
            console.log('❌ Usuario no encontrado');
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        // Comparamos la contraseña proporcionada con la contraseña hasheada almacenada en la base de datos.
        console.log('🔍 Comparando contraseñas...');
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        // Log para saber si la contraseña es correcta.
        console.log('Contraseña coincide:', isMatch ? 'Sí' : 'No');
        // Si las contraseñas no coinciden, devolvemos un error 401 (Unauthorized).
        if (!isMatch) {
            console.log('❌ Contraseña incorrecta');
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        // Verificamos que la clave secreta para JWT esté definida en las variables de entorno.
        if (!process.env.JWT_SECRET) {
            console.log('❌ JWT_SECRET no definido');
            // Si no está definida, es un error de configuración del servidor (500 Internal Server Error).
            return res.status(500).json({ message: 'Error de configuración del servidor' });
        }
        // Si todo es correcto, generamos un token JWT.
        console.log('🔍 Generando token...');
        // Firmamos el token con el ID y el rol del usuario, y le damos una expiración de 1 hora.
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role_id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        // Para mayor seguridad, eliminamos la contraseña del objeto de usuario antes de enviarlo en la respuesta.
        const { password: _, ...userWithoutPassword } = user;
        console.log('✅ Login exitoso');
        // Enviamos una respuesta JSON con los datos del usuario (sin la contraseña) y el token de acceso.
        res.json({ user: userWithoutPassword, accessToken: token });
        // Si ocurre cualquier otro error en el bloque try, lo capturamos aquí.
    }
    catch (error) {
        console.error('💥 Error en login:', error);
        // Registramos el error en la consola para depuración.
        console.error('Error en login:', error);
        // Devolvemos un error 500 (Internal Server Error) al cliente.
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.login = login;
