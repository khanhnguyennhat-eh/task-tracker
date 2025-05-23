// File: src/lib/check-db.ts
import { PrismaClient } from '@prisma/client';

/**
 * Checks if the database is properly set up and initialized
 */
export async function checkDatabaseHealth() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking database health...');
    
    // Try to query the Task table
    await prisma.task.findFirst();
    console.log('Database is healthy!');
    
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    throw error; // Propagate the error
  } finally {
    await prisma.$disconnect();
  }
}
