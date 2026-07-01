import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

// Prevent multiple pool instances during Next.js Hot Reloading
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    ssl: false,
    max: 10, // batasi maksimum koneksi agar instan
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};
