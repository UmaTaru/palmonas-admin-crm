import dotenv from "dotenv";

dotenv.config();

console.log("🚀 Worker started...");

// Keep process alive
setInterval(() => {
  console.log("Worker heartbeat...");
}, 10000);
