// file: db/schema/expenses.ts
import { pgTable, text, timestamp, uuid, integer, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";
import { paymentMethods } from "./payment-methods";

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
    paymentMethodId: uuid("payment_method_id").notNull().references(() => paymentMethods.id, { onDelete: "restrict" }),
    expenseDate: timestamp("expense_date", { withTimezone: true }).notNull(),
    amount: integer("amount").notNull(), // Stored in minor units (e.g. cents/poisha)
    description: text("description").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("expenses_user_id_idx").on(table.userId),
    expenseDateIdx: index("expenses_date_idx").on(table.expenseDate),
    categoryIdIdx: index("expenses_category_id_idx").on(table.categoryId),
    paymentMethodIdIdx: index("expenses_payment_method_id_idx").on(table.paymentMethodId),
    userDateIdx: index("expenses_user_date_idx").on(table.userId, table.expenseDate),
  })
);