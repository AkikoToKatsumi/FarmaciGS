#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando aplicación en modo prueba...\n');

// Iniciar Electron
const electronPath = path.join(__dirname, '..', 'electron', 'main.js');
const appPath = __dirname;

const electron = spawn('electron', [electronPath], {
  cwd: appPath,
  stdio: 'inherit',
  shell: true,
});

electron.on('error', (err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

electron.on('close', (code) => {
  console.log('Aplicación cerrada');
  process.exit(code || 0);
});
