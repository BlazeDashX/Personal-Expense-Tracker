// file: db/schema/user-preferences.ts
import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  currencyCode: text("currency_code").default("BDT").notNull(),
  locale: text("locale").default("en-BD").notNull(),
  weekStartsOn: text("week_starts_on").default("0").notNull(), // 0 = Sunday, 1 = Monday
  mealTarget: integer("meal_target").default(3).notNull(),
  onboardingCompleted: integer("onboarding_completed").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});