export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[]; // Ej: ['inventory:read', 'sales:create']
  createdAt: Date;
}
