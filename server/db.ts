
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Use connection pooler for better performance
const poolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2');

export const pool = new Pool({
  connectionString: poolUrl,
  max: 10,
});
