#!/usr/bin/env node

const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

async function checkSchema() {
  try {
    const client = await pgPool.connect();
    
    console.log('=== VERIFICANDO ESQUEMA DE POSTGRES ===\n');
    
    // Obtener información de la tabla medicine
    const medicineResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'medicine'
      ORDER BY ordinal_position
    `);
    
    console.log('Tabla "medicine" en PostgreSQL:');
    medicineResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Obtener información de la tabla users
    const usersResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\nTabla "users" en PostgreSQL:');
    usersResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pgPool.end();
  }
}

checkSchema();
