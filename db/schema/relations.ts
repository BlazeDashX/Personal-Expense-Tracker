// file: db/schema/relations.ts
import { relations } from "drizzle-orm";
import { users } from "./users";
import { categories } from "./categories";
import { paymentMethods } from "./payment-methods";
import { people } from "./people";
import { expenses } from "./expenses";
import { transactions } from "./transactions";
import { meals } from "./meals";
import { monthlyBudgets } from "./monthly-budgets";
import { userPreferences } from "./user-preferences";
import { quickShortcuts } from "./quick-shortcuts";
import { categoryBudgets } from "./category-budgets";

// Drizzle ORM Relations definitions (helps with structured queries)
export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  categories: many(categories),
  paymentMethods: many(paymentMethods),
  people: many(people),
  expenses: many(expenses),
  transactions: many(transactions),
  meals: many(meals),
  monthlyBudgets: many(monthlyBudgets),
  quickShortcuts: many(quickShortcuts),
  categoryBudgets: many(categoryBudgets),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, { fields: [expenses.userId], references: [users.id] }),
  category: one(categories, { fields: [expenses.categoryId], references: [categories.id] }),
  paymentMethod: one(paymentMethods, { fields: [expenses.paymentMethodId], references: [paymentMethods.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  person: one(people, { fields: [transactions.personId], references: [people.id] }),
  paymentMethod: one(paymentMethods, { fields: [transactions.paymentMethodId], references: [paymentMethods.id] }),
  destinationPaymentMethod: one(paymentMethods, { fields: [transactions.destinationPaymentMethodId], references: [paymentMethods.id] }),
}));

export const quickShortcutsRelations = relations(quickShortcuts, ({ one }) => ({
  user: one(users, { fields: [quickShortcuts.userId], references: [users.id] }),
  category: one(categories, { fields: [quickShortcuts.categoryId], references: [categories.id] }),
  paymentMethod: one(paymentMethods, { fields: [quickShortcuts.paymentMethodId], references: [paymentMethods.id] }),
}));

export const categoryBudgetsRelations = relations(categoryBudgets, ({ one }) => ({
  user: one(users, { fields: [categoryBudgets.userId], references: [users.id] }),
  category: one(categories, { fields: [categoryBudgets.categoryId], references: [categories.id] }),
}));