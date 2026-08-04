import { db } from "@/db";
import { expenses, transactions } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { fromMinorUnits } from "@/lib/finance";

export type ActivityType = "EXPENSE" | "CASH_IN" | "CASH_OUT" | "LOAN_GIVEN" | "LOAN_RECEIVED" | "BORROWED" | "RETURNED" | "TRANSFER";

export interface UnifiedActivity {
  id: string;
  type: ActivityType;
  date: Date;
  amount: number;
  description: string;
  category?: { name: string; color: string; icon: string };
  categoryId?: string;
  paymentMethod: { name: string };
  paymentMethodId: string;
  person?: { name: string };
  personId?: string;
  isPositive: boolean;
  isNeutral: boolean;
}

export async function getActivity(filters?: { startDate?: Date; endDate?: Date; type?: "all" | "expenses" | "income" | "transfers" }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const expenseWhere = [eq(expenses.userId, userId)];
  const txWhere = [eq(transactions.userId, userId)];

  if (filters?.startDate) {
    expenseWhere.push(gte(expenses.expenseDate, filters.startDate));
    txWhere.push(gte(transactions.transactionDate, filters.startDate));
  }
  if (filters?.endDate) {
    expenseWhere.push(lte(expenses.expenseDate, filters.endDate));
    txWhere.push(lte(transactions.transactionDate, filters.endDate));
  }

  let fetchExpenses = true;
  let fetchTx = true;

  if (filters?.type) {
    if (filters.type === "expenses") {
      fetchTx = false; // Only expenses
    } else if (filters.type === "income" || filters.type === "transfers") {
      fetchExpenses = false; // Only transactions
    }
  }

  const unified: UnifiedActivity[] = [];

  if (fetchExpenses) {
    const expenseRecords = await db.query.expenses.findMany({
      where: and(...expenseWhere),
      with: { category: true, paymentMethod: true }
    });
    
    for (const exp of expenseRecords) {
      unified.push({
        id: exp.id,
        type: "EXPENSE",
        date: exp.expenseDate,
        amount: fromMinorUnits(exp.amount),
        description: exp.description,
        category: exp.category || undefined,
        categoryId: exp.categoryId || undefined,
        paymentMethod: exp.paymentMethod,
        paymentMethodId: exp.paymentMethodId,
        isPositive: false,
        isNeutral: false,
      });
    }
  }

  if (fetchTx) {
    const txRecords = await db.query.transactions.findMany({
      where: and(...txWhere),
      with: { paymentMethod: true, person: true }
    });

    for (const tx of txRecords) {
      const isIncome = ["CASH_IN", "LOAN_RECEIVED", "BORROWED"].includes(tx.type);
      const isNeutral = tx.type === "TRANSFER";
      
      if (filters?.type === "income" && !isIncome) continue;
      if (filters?.type === "transfers" && !isNeutral) continue;
      
      unified.push({
        id: tx.id,
        type: tx.type,
        date: tx.transactionDate,
        amount: fromMinorUnits(tx.amount),
        description: tx.notes || tx.type.replace("_", " "),
        paymentMethod: tx.paymentMethod,
        paymentMethodId: tx.paymentMethodId,
        person: tx.person ?? undefined,
        personId: tx.personId ?? undefined,
        isPositive: isIncome,
        isNeutral,
      });
    }
  }

  unified.sort((a, b) => b.date.getTime() - a.date.getTime());
  return unified;
}
