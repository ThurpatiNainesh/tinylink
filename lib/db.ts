import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Direct database configuration
const DATABASE_URL = 'postgresql://neondb_owner:npg_qSyoATN95kMh@ep-withered-boat-adpdjgj7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Create the connection pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Set to false for development, use true in production with proper certificates
  },
});

// Set up Drizzle with the connection pool and schema
export const db = drizzle(pool, { schema });

// Clean up the pool when the application exits
process.on('exit', () => {
  pool.end().catch(console.error);
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  pool.end().catch(console.error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  pool.end().catch(console.error);
  process.exit(1);
});