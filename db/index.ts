// file: db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Create the Neon HTTP client
const sql = neon(env.DATABASE_URL);

// Initialize Drizzle ORM
export const db = drizzle(sql, { schema });

