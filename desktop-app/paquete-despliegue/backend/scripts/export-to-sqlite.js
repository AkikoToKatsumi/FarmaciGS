#!/usr/bin/env node

/**
 * Script para exportar datos de PostgreSQL a SQLite para la app de escritorio
 * Uso: node scripts/export-to-sqlite.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

// Cargar variables de entorno
require('dotenv').config({ path: '../.env' });

// Configuración de PostgreSQL
const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

// Ruta de salida de la base de datos SQLite
const desktopAppPath = path.join(__dirname, '../../desktop-app/database');
const sqlitePath = path.join(desktopAppPath, 'farmacia.db');

// Asegurar que la carpeta existe
if (!fs.existsSync(desktopAppPath)) {
  fs.mkdirSync(desktopAppPath, { recursive: true });
}

console.log('📦 Iniciando exportación de datos...');
console.log(`📁 Origen: PostgreSQL (${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})`);
console.log(`💾 Destino: ${sqlitePath}`);

// Mapeo de tablas de PostgreSQL a SQLite
const TABLES_TO_EXPORT = [
  'users',
  'roles',
  'permissions',
  'clients',
  'employees',
  'medicine',
  'providers',
  'prescriptions',
  'prescription_medicines',
  'sales',
  'sale_items',
  'returns',
  'audit_log'
];

// Función para obtener columnas reales de una tabla en SQLite
async function getSQLiteColumns(db, tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err) {
        resolve([]); // Si hay error, devolver vacío
      } else {
        resolve(rows ? rows.map(r => r.name) : []);
      }
    });
  });
}

// Función para obtener columnas reales de una tabla en PostgreSQL
async function getPostgresColumns(client, tableName) {
  try {
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    return result.rows.map(r => r.column_name);
  } catch (err) {
    return [];
  }
}


async function exportData() {
  let sqliteDb;
  try {
    // Conectar a PostgreSQL
    const pgClient = await pgPool.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Crear o limpiar base de datos SQLite
    sqliteDb = new sqlite3.Database(sqlitePath);

    // Crear tablas en SQLite usando el esquema adaptado
    const schemaPath = path.join(__dirname, 'sqlite-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await new Promise((resolve, reject) => {
        sqliteDb.exec(schemaSql, (err) => {
          if (err) {
            console.error('❌ Error creando tablas en SQLite:', err.message);
            reject(err);
          } else {
            console.log('✅ Tablas creadas en SQLite');
            resolve();
          }
        });
      });
    } else {
      console.warn('⚠️ No se encontró el archivo sqlite-schema.sql, no se crearán tablas automáticamente.');
    }

    // Deshabilitar constraint checking temporalmente para insertar datos más rápido
    await new Promise((resolve, reject) => {
      sqliteDb.run('PRAGMA foreign_keys = OFF', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('📥 Exportando tablas...');

    // Exportar cada tabla
    for (const table of TABLES_TO_EXPORT) {
      try {
        // Obtener columnas reales en ambas bases de datos
        const postgresColumns = await getPostgresColumns(pgClient, table);
        const sqliteColumns = await getSQLiteColumns(sqliteDb, table);
        
        if (postgresColumns.length === 0) {
          console.log(`  ⊘ ${table}: No existe en PostgreSQL`);
          continue;
        }

        // Filtrar solo las columnas que existen en ambas tablas
        const commonColumns = postgresColumns.filter(col => sqliteColumns.includes(col));
        
        if (commonColumns.length === 0) {
          console.log(`  ⚠ ${table}: No hay columnas en común`);
          continue;
        }

        // Obtener todos los registros con solo las columnas comunes
        const columnList = commonColumns.map(col => `"${col}"`).join(', ');
        const result = await pgClient.query(`SELECT ${columnList} FROM "${table}"`);
        
        if (result.rows.length === 0) {
          console.log(`  ⊘ ${table}: 0 registros`);
          continue;
        }

        // Preparar datos para inserción
        const values = result.rows.map(row => 
          commonColumns.map(col => {
            const value = row[col];
            // Manejo especial para valores null, booleanos y fechas
            if (value === null) return null;
            if (typeof value === 'boolean') return value ? 1 : 0;
            if (value instanceof Date) return value.toISOString();
            if (typeof value === 'number') return value;
            return String(value);
          })
        );

        // Insertar en SQLite usando transacción
        const placeholders = commonColumns.map(() => '?').join(', ');
        const columnListStr = commonColumns.join(', ');
        
        await new Promise((resolve, reject) => {
          sqliteDb.serialize(() => {
            sqliteDb.run('BEGIN TRANSACTION', (err) => {
              if (err) {
                console.error(`  ❌ Error en transacción de ${table}:`, err.message);
                reject(err);
                return;
              }

              const stmt = sqliteDb.prepare(
                `INSERT INTO ${table} (${columnListStr}) VALUES (${placeholders})`
              );

              let inserted = 0;
              let errors = 0;

              values.forEach((row, idx) => {
                stmt.run(...row, (err) => {
                  if (err) {
                    errors++;
                    console.error(`    ❌ Error en fila ${idx + 1}: ${err.message}`);
                  } else {
                    inserted++;
                  }
                });
              });

              stmt.finalize((err) => {
                if (err) {
                  sqliteDb.run('ROLLBACK', () => {
                    console.error(`  ❌ Error finalizando inserción en ${table}:`, err.message);
                    reject(err);
                  });
                } else {
                  sqliteDb.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                      console.error(`  ❌ Error en COMMIT de ${table}:`, commitErr.message);
                      reject(commitErr);
                    } else {
                      console.log(`  ✓ ${table}: ${inserted} registros insertados${errors > 0 ? ` (${errors} errores)` : ''}`);
                      resolve();
                    }
                  });
                }
              });
            });
          });
        });

      } catch (err) {
        console.warn(`  ⚠ ${table}: Error durante la exportación (${err.message})`);
      }
    }

    // Reactivar constraint checking
    await new Promise((resolve, reject) => {
      sqliteDb.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('\n✅ Exportación completada exitosamente');
    console.log(`📂 Archivo guardado en: ${sqlitePath}`);

    // Mostrar estadísticas
    await new Promise((resolve) => {
      sqliteDb.serialize(() => {
        let totalRecords = 0;
        let completed = 0;
        
        TABLES_TO_EXPORT.forEach(table => {
          sqliteDb.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
            completed++;
            if (!err && row) {
              totalRecords += row.count;
              console.log(`  📊 ${table}: ${row.count} registros`);
            }
            if (completed === TABLES_TO_EXPORT.length) {
              console.log(`\n📈 Total de registros importados: ${totalRecords}`);
              resolve();
            }
          });
        });
      });
    });

    pgClient.release();

  } catch (err) {
    console.error('\n❌ Error durante la exportación:', err);
    process.exit(1);
  } finally {
    // Cerrar conexiones
    if (sqliteDb) {
      await new Promise((resolve) => {
        sqliteDb.close((err) => {
          if (err) console.error('Error cerrando SQLite:', err);
          resolve();
        });
      });
    }
    await pgPool.end();
  }
}

// Ejecutar exportación
exportData().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
