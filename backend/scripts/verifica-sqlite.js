// Script para verificar tablas y conteo de registros en farmacia.db
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../desktop-app/database/farmacia.db');
const db = new sqlite3.Database(dbPath);

console.log('Verificando tablas y conteo de registros en farmacia.db...');

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
    if (err) {
      console.error('Error al listar tablas:', err.message);
      db.close();
      return;
    }
    if (!tables.length) {
      console.log('No hay tablas en la base de datos.');
      db.close();
      return;
    }
    console.log('Tablas encontradas:');
    tables.forEach(t => console.log(' -', t.name));
    console.log('\nConteo de registros por tabla:');
    let completed = 0;
    tables.forEach(t => {
      db.get(`SELECT COUNT(*) as count FROM ${t.name}`, (err, row) => {
        completed++;
        if (err) {
          console.log(`  ${t.name}: error`);
        } else {
          console.log(`  ${t.name}: ${row.count}`);
        }
        if (completed === tables.length) {
          db.close();
        }
      });
    });
  });
});
