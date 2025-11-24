/// <reference types="vite/client" />

// Declaraciones de tipos para módulos que podrían no tener tipos completos
declare module 'xlsx' {
  export * from 'xlsx';
}

declare module 'jspdf' {
  export * from 'jspdf';
}

declare module 'jspdf-autotable' {
  export * from 'jspdf-autotable';
}
