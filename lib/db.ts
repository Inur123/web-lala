import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: false, // Default false di local
});

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};
