import bcrypt from 'bcryptjs';
import pool from './db';

const insertUsers = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await pool.query(
    'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4)',
    ['Admin', 'admin@example.com', hashedPassword, 1] // 1 debe ser el ID del rol 'admin'
  );

  console.log('Usuario insertado con contraseña encriptada');
};

insertUsers();
