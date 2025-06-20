// src/config/database.ts
// src/config/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();


// Function to connect to the database
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};