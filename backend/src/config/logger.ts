// c:\Farmacia GS\backend\src\config\logger.ts
// Exportamos un objeto 'logger' que nos proporciona un sistema de registro simple y centralizado.
// Esto nos permite estandarizar cómo mostramos los mensajes en la consola.
export const logger = {
  info: (msg: string, response?: any) => {
  console.log(`✅ INFO: ${msg}`);
  if (response) {
    console.log('📊 RESPONSE:', JSON.stringify(response, null, 2));
  }
},

  // Método para registrar mensajes informativos.
  
  // Método para registrar advertencias.
  warn: (msg: string) => console.warn(`⚠️ WARN: ${msg}`),
  // Método para registrar errores.
  error: (msg: string, detail?: any) => {
  console.error(`❌ ERROR: ${msg}`);
  if (detail) console.error(detail);
},

};
