import { pgTable, text, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";
import { paymentMethods } from "./payment-methods";
import { transactionTypeEnum } from "./transactions";

export const shortcutTypeEnum = pgEnum("shortcut_type", ["EXPENSE", "TRANSACTION"]);

export const quickShortcuts = pgTable("quick_shortcuts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: shortcutTypeEnum("type").notNull(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(), // minor units
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }), // Only for EXPENSE
  paymentMethodId: uuid("payment_method_id").notNull().references(() => paymentMethods.id, { onDelete: "cascade" }),
  transactionType: text("transaction_type"), // E.g., 'CASH_IN', 'TRANSFER'. Only for TRANSACTION.
  icon: text("icon").default("Circle").notNull(),
  color: text("color"),
  orderIndex: integer("order_index").default(0).notNull(),
  instantMode: integer("instant_mode").default(1).notNull(), // 1 = instant, 0 = confirm
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
