// file: db/schema/transactions.ts
import { pgTable, text, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { people } from "./people";
import { paymentMethods } from "./payment-methods";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "CASH_IN",
  "CASH_OUT",
  "LOAN_GIVEN",
  "LOAN_RECEIVED",
  "BORROWED",
  "RETURNED",
  "TRANSFER",
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  personId: uuid("person_id").references(() => people.id, { onDelete: "restrict" }),
  paymentMethodId: uuid("payment_method_id").notNull().references(() => paymentMethods.id, { onDelete: "restrict" }),
  destinationPaymentMethodId: uuid("destination_payment_method_id").references(() => paymentMethods.id, { onDelete: "restrict" }),
  type: transactionTypeEnum("type").notNull(),
  transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
  amount: integer("amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});