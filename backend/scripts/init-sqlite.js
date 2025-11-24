#!/usr/bin/env node

/**
 * Script para inicializar la BD SQLite con el esquema completo
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const desktopAppPath = path.join(__dirname, '../../desktop-app/database');
const sqlitePath = path.join(desktopAppPath, 'farmacia.db');
const sqlFilePath = path.join(desktopAppPath, 'farmacia_sqlite.sql');

console.log('📝 Inicializando esquema de SQLite...');
console.log(`📁 Leyendo: ${sqlFilePath}`);

if (!fs.existsSync(sqlFilePath)) {
  console.error('❌ No se encontró archivo de esquema:', sqlFilePath);
  process.exit(1);
}

const sql = fs.readFileSync(sqlFilePath, 'utf8');

const db = new sqlite3.Database(sqlitePath, (err) => {
  if (err) {
    console.error('❌ Error al abrir BD:', err);
    process.exit(1);
  }

  console.log('✅ Base de datos creada/abierta');

  db.exec(sql, (err) => {
    if (err) {
      console.error('❌ Error ejecutando esquema:', err);
      db.close();
      process.exit(1);
    }

    console.log('✅ Esquema inicializado correctamente');
    
    // Verificar tablas creadas
    db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `, (err, tables) => {
      if (err) {
        console.error('Error verificando tablas:', err);
      } else {
        console.log(`\n📊 Tablas creadas (${tables.length}):`);
        tables.forEach(t => console.log(`   - ${t.name}`));
      }

      db.close((err) => {
        if (err) console.error('Error cerrando BD:', err);
        console.log('\n✅ Listo para importar datos');
      });
    });
  });
});
