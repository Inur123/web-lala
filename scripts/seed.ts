import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: false,
});

async function main() {
  console.log("⏳ Setting up Better Auth database tables...");

  // 1. Create user table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      "emailVerified" BOOLEAN NOT NULL DEFAULT false,
      image TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 2. Create session table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      id TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMP NOT NULL,
      token TEXT UNIQUE NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    );
  `);

  // 3. Create account table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "account" (
      id TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "expiresAt" TIMESTAMP,
      "password" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 4. Create verification table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "verification" (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ Better Auth tables verified/created.");

  // 5. Seed default admin user
  const email = "superadmin@pelajarnumagetan.or.id";
  const name = "Super Admin Magetan";
  const userId = "admin-user-id-magetan-123";

  // Clean existing seed user
  await pool.query('DELETE FROM "account" WHERE "userId" = $1', [userId]);
  await pool.query('DELETE FROM "user" WHERE id = $1 OR email = $2', [userId, email]);

  // Insert user
  await pool.query(
    'INSERT INTO "user" (id, name, email, "emailVerified") VALUES ($1, $2, $3, $4)',
    [userId, name, email, true]
  );

  // Hash password using better-auth hashing
  const hashedPassword = await hashPassword("password123");

  // Insert credential account for email/password signin
  const accountId = "credential-account-id";
  await pool.query(
    'INSERT INTO "account" (id, "accountId", "providerId", "userId", password) VALUES ($1, $2, $3, $4, $5)',
    [accountId, email, "credential", userId, hashedPassword]
  );

  // 6. Create registrations table (with 2-stage selection support)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      delegation TEXT NOT NULL,
      reason TEXT NOT NULL,
      shirt_size TEXT NOT NULL,
      sleeve_type TEXT NOT NULL,
      whatsapp TEXT,
      birth_date TEXT,
      email TEXT UNIQUE,
      -- Tahap 1: Seleksi Administrasi
      admin_status TEXT NOT NULL DEFAULT 'pending',
      admin_note TEXT,
      admin_reviewed_at TIMESTAMP WITH TIME ZONE,
      -- Tahap 2: Seleksi Screening
      screening_status TEXT NOT NULL DEFAULT 'pending',
      screening_note TEXT,
      screening_reviewed_at TIMESTAMP WITH TIME ZONE,
      -- Timestamps
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing table: add 2-stage columns if they don't exist yet
  const alterColumns = [
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS whatsapp TEXT`,
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS birth_date TEXT`,
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email TEXT UNIQUE`,
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS admin_status TEXT NOT NULL DEFAULT 'pending'`,
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS admin_note TEXT`,
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS screening_status TEXT NOT NULL DEFAULT 'pending'`,
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS screening_note TEXT`,
    `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS screening_reviewed_at TIMESTAMP WITH TIME ZONE`,
  ];
  for (const sql of alterColumns) {
    await pool.query(sql);
  }

  // 7. Create registration_files table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS registration_files (
      id TEXT PRIMARY KEY,
      registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
      field_key TEXT NOT NULL,
      file_name TEXT NOT NULL,
      r2_key TEXT NOT NULL,
      r2_url TEXT,
      file_size INTEGER,
      mime_type TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Create system_settings table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert default setting: registration_open = true
  await pool.query(`
    INSERT INTO system_settings (key, value)
    VALUES ('registration_open', 'true')
    ON CONFLICT (key) DO NOTHING
  `);

  console.log(`✅ Database successfully seeded. Default admin created:`);
  console.log(`📧 Email   : ${email}`);
  console.log(`🔑 Password: password123`);
  console.log(`✅ Tables 'registrations' & 'registration_files' verified/created.`);
  console.log(`✅ 2-stage selection columns (admin + screening) verified.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
