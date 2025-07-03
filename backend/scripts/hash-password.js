// scripts/hash-password.js
const bcrypt = require('bcryptjs');

async function hashPassword() {
  const plainPassword = 'admin123';
  const saltRounds = 10;
  
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log('='.repeat(50));
    console.log('GENERADOR DE HASH PARA CONTRASEÑAS');
    console.log('='.repeat(50));
    console.log('Contraseña original:', plainPassword);
    console.log('Contraseña hasheada:', hashedPassword);
    
    // Verificar que funciona
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Verificación:', isMatch ? '✅ CORRECTA' : '❌ INCORRECTA');
    
    console.log('\n' + '-'.repeat(50));
    console.log('SQL PARA ACTUALIZAR LA BASE DE DATOS:');
    console.log('-'.repeat(50));
    console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = 'admin@example.com';`);
    console.log('-'.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar la función
hashPassword();