// Definición de la interfaz para un rol de usuario
export interface Role {
  id: string; // Identificador único del rol
  name: string; // Nombre del rol
  description?: string; // Descripción del rol (opcional)
  permissions?: string[]; // Permisos asociados al rol (opcional). Ejemplo: ['inventory:read', 'sales:create']
  createdAt: Date; // Fecha de creación del rol
}
