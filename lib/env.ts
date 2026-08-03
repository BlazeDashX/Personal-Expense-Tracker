// file: lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("Must be a valid database URL"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_TRUST_HOST: z.string().optional().default("true"),
  NEXT_PUBLIC_APP_URL: z.string().url("Must be a valid URL").optional().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;