// file: features/search/actions/search-actions.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { expenses, transactions, people } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { fromMinorUnits } from "@/lib/finance";
import type { UnifiedActivity } from "@/features/activity/queries/get-activity";

export interface SearchResultPerson {
  id: string;
  name: string;
  phone?: string | null;
}

export interface SearchResults {
  expenses: UnifiedActivity[];
  transactions: UnifiedActivity[];
  people: SearchResultPerson[];
}

export async function searchCommandPalette(query: string): Promise<SearchResults> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 1) {
    return { expenses: [], transactions: [], people: [] };
  }

  // Fetch recent data for user
  const [allExpenses, allTransactions, allPeople] = await Promise.all([
    db.query.expenses.findMany({
      where: eq(expenses.userId, userId),
      with: { category: true, paymentMethod: true },
      orderBy: [desc(expenses.expenseDate)],
      limit: 100,
    }),
    db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      with: { paymentMethod: true, person: true },
      orderBy: [desc(transactions.transactionDate)],
      limit: 100,
    }),
    db.query.people.findMany({
      where: eq(people.userId, userId),
      limit: 50,
    }),
  ]);

  // Match Expenses
  const matchedExpenses: UnifiedActivity[] = allExpenses
    .filter((exp) => {
      const descMatch = exp.description?.toLowerCase().includes(trimmed);
      const catMatch = exp.category?.name?.toLowerCase().includes(trimmed);
      const pmMatch = exp.paymentMethod?.name?.toLowerCase().includes(trimmed);
      return descMatch || catMatch || pmMatch;
    })
    .slice(0, 5)
    .map((exp) => ({
      id: exp.id,
      type: "EXPENSE",
      amount: fromMinorUnits(exp.amount),
      description: exp.description || "Expense",
      date: exp.expenseDate,
      categoryId: exp.categoryId || undefined,
      category: exp.category ? { name: exp.category.name, icon: exp.category.icon, color: exp.category.color } : undefined,
      paymentMethodId: exp.paymentMethodId,
      paymentMethod: exp.paymentMethod ? { name: exp.paymentMethod.name } : { name: "Cash" },
      isPositive: false,
      isNeutral: false,
    }));

  // Match Transactions
  const matchedTransactions: UnifiedActivity[] = allTransactions
    .filter((tx) => {
      const notesMatch = tx.notes?.toLowerCase().includes(trimmed);
      const personMatch = tx.person?.name?.toLowerCase().includes(trimmed);
      const pmMatch = tx.paymentMethod?.name?.toLowerCase().includes(trimmed);
      const typeMatch = tx.type.toLowerCase().replaceAll("_", " ").includes(trimmed);
      return notesMatch || personMatch || pmMatch || typeMatch;
    })
    .slice(0, 5)
    .map((tx) => {
      const isPositive = ["CASH_IN", "LOAN_RECEIVED", "BORROWED"].includes(tx.type);
      const isNeutral = tx.type === "TRANSFER";

      return {
        id: tx.id,
        type: tx.type,
        amount: fromMinorUnits(tx.amount),
        description: tx.notes || tx.type.replaceAll("_", " "),
        date: tx.transactionDate,
        paymentMethodId: tx.paymentMethodId,
        paymentMethod: tx.paymentMethod ? { name: tx.paymentMethod.name } : { name: "Cash" },
        personId: tx.personId || undefined,
        person: tx.person ? { name: tx.person.name } : undefined,
        isPositive,
        isNeutral,
      };
    });

  // Match People
  const matchedPeople: SearchResultPerson[] = allPeople
    .filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(trimmed);
      const phoneMatch = p.phone?.toLowerCase().includes(trimmed);
      return nameMatch || phoneMatch;
    })
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
    }));

  return {
    expenses: matchedExpenses,
    transactions: matchedTransactions,
    people: matchedPeople,
  };
}
