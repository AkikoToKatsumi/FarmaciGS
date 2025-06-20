import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is not defined');

export const generateAccessToken = (payload: string | object | Buffer): string => {
  return jwt.sign(payload, JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  } as SignOptions);
};

export const generateRefreshToken = (payload: string | object | Buffer): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET as Secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as SignOptions);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET as Secret);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET as Secret);
};
