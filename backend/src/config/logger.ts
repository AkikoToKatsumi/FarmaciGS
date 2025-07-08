// c:\Farmacia GS\backend\src\config\logger.ts
// Exportamos un objeto 'logger' que nos proporciona un sistema de registro simple y centralizado.
// Esto nos permite estandarizar cómo mostramos los mensajes en la consola.
export const logger = {
  // Método para registrar mensajes informativos.
  info: (msg: string) => console.log(`✅ INFO: ${msg}`),
  // Método para registrar advertencias.
  warn: (msg: string) => console.warn(`⚠️ WARN: ${msg}`),
  // Método para registrar errores.
  error: (msg: string) => console.error(`❌ ERROR: ${msg}`),
};
