// file: scripts/add-onboarding-column.ts
import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Migrating PostgreSQL table user_preferences...");
  await db.execute(
    sql`ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS onboarding_completed INTEGER NOT NULL DEFAULT 0;`
  );
  console.log("Successfully added onboarding_completed column to user_preferences!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
