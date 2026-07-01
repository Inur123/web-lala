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
