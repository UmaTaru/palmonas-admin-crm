import fs from "fs";
import path from "path";
import { pool } from "./pool";

export const runMigrations = async () => {
  const client = await pool.connect();

  try {
    console.log("🔄 Running migrations...");

    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    const { rows } = await client.query(
      "SELECT name FROM migrations;"
    );

    const appliedMigrations = rows.map((r) => r.name);

    for (const file of files) {
      if (!appliedMigrations.includes(file)) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        console.log(`📦 Applying migration: ${file}`);

        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO migrations(name) VALUES($1)",
          [file]
        );
        await client.query("COMMIT");

        console.log(`✅ Migration applied: ${file}`);
      }
    }

    console.log("🎉 All migrations up to date.");
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
  }
};
