// file: db/schema/monthly-budgets.ts
import { pgTable, text, timestamp, uuid, integer, unique } from "drizzle-orm/pg-core";
import { users } from "./users";

export const monthlyBudgets = pgTable(
  "monthly_budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    budgetMonth: text("budget_month").notNull(), // Format: 'YYYY-MM'
    amount: integer("amount").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userBudgetMonthUnique: unique("user_budget_month_unique").on(table.userId, table.budgetMonth),
  })
);