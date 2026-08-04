import { pgTable, text, timestamp, uuid, integer, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";

export const categoryBudgets = pgTable(
  "category_budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    period: text("period").default("monthly").notNull(), // 'daily', 'weekly', 'monthly', 'custom'
    warningThreshold: integer("warning_threshold").default(80).notNull(), // percentage (e.g., 80 for 80%)
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userCategoryUnique: unique("user_category_budget_unique").on(table.userId, table.categoryId),
  })
);
