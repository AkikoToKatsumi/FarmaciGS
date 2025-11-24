#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const dbDir = path.join(__dirname, '..', 'database');
    const sqlFile = path.join(dbDir, 'farmacia_sqlite.sql');
    const dbFile = path.join(dbDir, 'farmacia.db');

    if (!fs.existsSync(sqlFile)) {
      console.error('SQL file not found:', sqlFile);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        console.error('Failed to open DB:', err);
        process.exit(1);
      }
    });

    // Enable foreign keys
    db.exec('PRAGMA foreign_keys = ON;', (err) => {
      if (err) console.warn('Warning enabling foreign_keys:', err.message);

      // Execute the SQL file
      db.exec(sql, function (execErr) {
        if (execErr) {
          console.error('Error executing SQL:', execErr.message);
          db.close();
          process.exit(1);
        }

        console.log('SQL import completed successfully. Listing tables...');
        db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;", (qErr, rows) => {
          if (qErr) {
            console.error('Error querying sqlite_master:', qErr.message);
          } else {
            console.log(JSON.stringify(rows, null, 2));
          }
          db.close();
        });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error && error.message ? error.message : error);
    console.error(error);
    process.exit(1);
  }
})();
