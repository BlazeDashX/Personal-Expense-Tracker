// file: drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Explicitly load from .env.local
config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});