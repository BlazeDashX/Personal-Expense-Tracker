// file: db/seed.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import * as schema from "./schema";

// Load env explicitly
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
// Pass the schema object so db.query works
const db = drizzle(sql, { schema });

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Create Admin User
    const username = "admin";
    const password = "admin123";
    const passwordHash = await bcrypt.hash(password, 10);

    let adminUser = await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });

    if (!adminUser) {
      console.log("Creating admin user...");
      const [newUser] = await db
        .insert(schema.users)
        .values({
          username,
          passwordHash,
          name: "Administrator",
        })
        .returning();
      adminUser = newUser;
    } else {
      console.log("Admin user already exists.");
    }

    const userId = adminUser.id;

    // 2. Create User Preferences
    const existingPrefs = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.userId, userId),
    });

    if (!existingPrefs) {
      console.log("Creating user preferences...");
      await db.insert(schema.userPreferences).values({
        userId,
        currencyCode: "BDT",
        locale: "en-BD",
        weekStartsOn: "0",
      });
    }

    // 3. Create Default Categories
    const defaultCategories = [
      { name: "Food", slug: "food", icon: "Utensils", color: "#f87171" },
      { name: "Snacks", slug: "snacks", icon: "Cookie", color: "#fb923c" },
      { name: "Breakfast", slug: "breakfast", icon: "Coffee", color: "#fbbf24" },
      { name: "Lunch", slug: "lunch", icon: "Salad", color: "#34d399" },
      { name: "Dinner", slug: "dinner", icon: "Pizza", color: "#60a5fa" },
      { name: "Travel", slug: "travel", icon: "Bus", color: "#818cf8" },
      { name: "University", slug: "university", icon: "GraduationCap", color: "#a78bfa" },
      { name: "Personal Expense", slug: "personal-expense", icon: "User", color: "#f472b6" },
      { name: "Bazar", slug: "bazar", icon: "ShoppingCart", color: "#fb7185" },
    ];

    console.log("Inserting categories...");
    for (const cat of defaultCategories) {
      const existing = await db.query.categories.findFirst({
        where: (categories, { and, eq }) =>
          and(eq(categories.userId, userId), eq(categories.slug, cat.slug)),
      });
      if (!existing) {
        await db.insert(schema.categories).values({ ...cat, userId, isDefault: true });
      }
    }

    // 4. Create Default Payment Methods
    const defaultPaymentMethods = [
      { name: "Cash", icon: "Banknote", color: "#22c55e" },
      { name: "bKash", icon: "Smartphone", color: "#ec4899" },
      { name: "Nagad", icon: "Smartphone", color: "#f97316" },
      { name: "Bank", icon: "Landmark", color: "#3b82f6" },
      { name: "Card", icon: "CreditCard", color: "#8b5cf6" },
    ];

    console.log("Inserting payment methods...");
    for (const pm of defaultPaymentMethods) {
      const existing = await db.query.paymentMethods.findFirst({
        where: (paymentMethods, { and, eq }) =>
          and(eq(paymentMethods.userId, userId), eq(paymentMethods.name, pm.name)),
      });
      if (!existing) {
        await db.insert(schema.paymentMethods).values({ ...pm, userId, isDefault: true });
      }
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();