const Database = require('better-sqlite3');
const db = new Database('database/farmacia.db');

// Listar tablas
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tablas en la BD:');
tables.forEach(t => console.log(' -', t.name));

// Contar filas por tabla
console.log('\nFilas por tabla:');
tables.forEach(t => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get();
    console.log(` - ${t.name}: ${count.count} filas`);
  } catch (e) {
    console.log(` - ${t.name}: ERROR`);
  }
});

db.close();
