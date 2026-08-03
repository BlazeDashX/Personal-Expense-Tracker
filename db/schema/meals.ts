// file: db/schema/meals.ts
import { pgTable, text, timestamp, uuid, integer, unique } from "drizzle-orm/pg-core";
import { users } from "./users";

export const meals = pgTable(
  "meals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    mealDate: timestamp("meal_date", { withTimezone: true, mode: "date" }).notNull(),
    mealCount: integer("meal_count").notNull(), // 0, 1, or 2
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userMealDateUnique: unique("user_meal_date_unique").on(table.userId, table.mealDate),
  })
);