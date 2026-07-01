import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: false,
});

async function main() {
  console.log("⏳ Running database setup & seeder...");

  // 1. Create users table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Table 'users' verified/created.");

  // 2. Seed default admin
  const email = "superadmin@pelajarnumagetan.or.id";
  
  // Clean existing
  await pool.query("DELETE FROM users WHERE email = $1", [email]);

  const hashedPassword = await bcrypt.hash("password123", 10);
  const name = "Super Admin Magetan";

  await pool.query(
    "INSERT INTO users (email, password, name) VALUES ($1, $2, $3)",
    [email, hashedPassword, name]
  );

  console.log(`✅ Database successfully seeded. Default admin created:`);
  console.log(`📧 Email   : ${email}`);
  console.log(`🔑 Password: password123`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
