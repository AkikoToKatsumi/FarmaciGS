import dotenv from 'dotenv';
dotenv.config();
if (!process.env.DB_USER || !process.env.DB_NAME || !process.env.JWT_SECRET) {
    throw new Error("❌ Faltan variables de entorno requeridas");
}
export const config = {
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 5432,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
};
