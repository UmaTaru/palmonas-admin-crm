import dotenv from "dotenv";
import app from "./app";
import { checkDatabaseConnection } from "./database/pool";
import { runMigrations } from "./database/migrate";
import { seedAdminUser } from "./database/seed";
import { configService } from "./config/config.service";
import { seedDefaultConfigs } from "./database/seed";


dotenv.config();

const PORT = process.env.PORT || 4000;

let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  try {
    // 🔹 Validate database connection before starting server
    await checkDatabaseConnection();
    await runMigrations();
    await seedAdminUser();
    await seedDefaultConfigs();
    await configService.load();

    // 🔹 Start HTTP server only after DB is healthy
    server = app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// 🔹 Graceful shutdown handler
const shutdown = (signal: string) => {
  console.log(`⚠️  Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(() => {
      console.log("✅ HTTP server closed.");
      process.exit(0);
    });
  }

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("❌ Forcefully shutting down...");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
