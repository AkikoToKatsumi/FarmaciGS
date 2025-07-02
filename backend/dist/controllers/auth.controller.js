import bcrypt from "bcrypt";
import pool from "../config/db";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { logger } from "../config/logger";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
// Generar el token de acceso
const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};
// Verificar el refresh token
const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    const userResult = await pool.query(`SELECT users.*, roles.name as role_name 
     FROM users 
     LEFT JOIN roles ON users.role_id = roles.id
     WHERE users.email = $1`, [email]);
    const user = userResult.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const payload = { id: user.id, email: user.email, role: user.role_name };
    const accessToken = generateAccessToken(payload);
    const refreshTokenRaw = crypto.randomBytes(64).toString("hex");
    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshTokenRaw)
        .digest("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await pool.query("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)", [user.id, refreshTokenHash, expiresAt]);
    res.json({ accessToken, refreshToken: refreshTokenRaw, user: payload });
};
export const refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token)
        return res.status(400).json({ message: "Token requerido" });
    try {
        const payload = verifyRefreshToken(token);
        if (typeof payload === "object" &&
            payload !== null &&
            "id" in payload &&
            "email" in payload &&
            "role" in payload) {
            const accessToken = generateAccessToken({
                id: payload.id,
                email: payload.email,
                role: payload.role,
            });
            res.json({ accessToken });
        }
        else {
            res.status(403).json({ message: "Refresh token inválido" });
        }
    }
    catch {
        res.status(403).json({ message: "Refresh token inválido" });
    }
};
logger.info("Servidor iniciado...");
