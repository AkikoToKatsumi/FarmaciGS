// Definición de la interfaz para una sucursal (Branch)
export interface Branch {
  id: string; // Identificador único de la sucursal
  name: string; // Nombre de la sucursal
  address: string; // Dirección de la sucursal
  phone?: string; // Teléfono de la sucursal (opcional)
  createdAt: Date; // Fecha de creación de la sucursal
}
