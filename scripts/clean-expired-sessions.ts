import { cleanExpiredSessions } from "../lib/auth";

async function cleanSessions() {
  try {
    console.log("Starting expired sessions cleanup...");
    await cleanExpiredSessions();
    console.log("Expired sessions cleanup completed successfully.");
  } catch (error) {
    console.error("Error during expired sessions cleanup:", error);
    process.exit(1);
  }
}

cleanSessions();
