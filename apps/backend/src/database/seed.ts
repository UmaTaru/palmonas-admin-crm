import bcrypt from "bcrypt";
import { pool } from "./pool";

export const seedAdminUser = async () => {
  try {
    const email = "admin@palmonas.com";
    const password = "Admin@123"; // Dev default only

    const { rows } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (rows.length > 0) {
      console.log("👤 Admin user already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)`,
      [email, hashedPassword, "SUPER_ADMIN"]
    );

    console.log("✅ Default admin user created:");
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
  } catch (error) {
    console.error("❌ Failed to seed admin user:", error);
    process.exit(1);
  }
};

export const seedDefaultConfigs = async () => {
  try {
    const defaultConfigs = [
      { name: "ACCESS_TOKEN_EXPIRY", value: "900" },     // 15 mins
      { name: "REFRESH_TOKEN_EXPIRY", value: "54000" },  // 15 hours
    ];

    for (const config of defaultConfigs) {
      const { rows } = await pool.query(
        "SELECT id FROM app_config WHERE name = $1",
        [config.name]
      );

      if (rows.length === 0) {
        await pool.query(
          `INSERT INTO app_config (name, value, status)
           VALUES ($1, $2, 'active')`,
          [config.name, config.value]
        );

        console.log(`✅ Config seeded: ${config.name}`);
      }
    }
  } catch (error) {
    console.error("❌ Failed to seed default configs:", error);
    process.exit(1);
  }
};

