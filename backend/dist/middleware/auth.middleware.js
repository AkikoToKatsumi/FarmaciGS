import jwt from 'jsonwebtoken';
// Función auxiliar para verificar token
const verifyAccessToken = (token) => {
    const secret = process.env.JWT_SECRET;
    return jwt.verify(token, secret);
};
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: 'Token no proporcionado' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};
