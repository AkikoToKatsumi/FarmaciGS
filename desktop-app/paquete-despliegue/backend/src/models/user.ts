// Definición de la interfaz para un usuario
export interface User {
  id: number; // Identificador único del usuario
  name: string; // Nombre del usuario
  email: string; // Correo electrónico
  password: string; // Contraseña hasheada
  role: UserRole; // Rol del usuario
  created_at: Date; // Fecha de creación
}

// Datos requeridos para crear un usuario
export interface CreateUserData {
  name: string; // Nombre
  email: string; // Correo electrónico
  password: string; // Contraseña
  role: UserRole; // Rol
}

// Datos permitidos para actualizar un usuario
export interface UpdateUserData {
  name?: string; // Nombre (opcional)
  email?: string; // Correo electrónico (opcional)
  password?: string; // Contraseña (opcional)
  role?: UserRole; // Rol (opcional)
}

// Respuesta de usuario con información adicional
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
}

// Enum para los roles de usuario
export enum UserRole {
  ADMIN = 'admin', // Administrador
  PHARMACIST = 'pharmacist', // Farmacéutico
  CASHIER = 'cashier', // Cajero
  EMPLOYEE = 'employee' // Empleado
}

// Credenciales para login
export interface LoginCredentials {
  email: string; // Correo electrónico
  password: string; // Contraseña
}

// Tokens de autenticación
export interface AuthTokens {
  accessToken: string; // Token de acceso
  refreshToken: string; // Token de refresco
}

// Payload del JWT
export interface JWTPayload {
  userId: number; // ID del usuario
  email: string; // Correo electrónico
  role: UserRole; // Rol
  iat?: number; // Fecha de emisión (opcional)
  exp?: number; // Fecha de expiración (opcional)
}