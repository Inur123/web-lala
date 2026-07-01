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
    max: 30, // dinaikkan agar tidak kehabisan koneksi saat hot reload
    idleTimeoutMillis: 60000, // naikkan waktu idle
    connectionTimeoutMillis: 10000, // naikkan ke 10 detik agar tidak mudah timeout
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};
