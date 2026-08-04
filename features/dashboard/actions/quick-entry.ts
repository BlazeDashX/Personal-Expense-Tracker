"use server";

import { db } from "@/db";
import { expenses, transactions } from "@/db/schema";
import { auth } from "@/auth";
import { toMinorUnits } from "@/lib/finance";
import { revalidatePath } from "next/cache";

export async function submitQuickEntry(data: {
  amount: number;
  description: string;
  type: string;
  categoryId?: string;
  paymentMethodId: string;
  date: Date;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;
  
  if (data.type === "EXPENSE") {
    if (!data.categoryId) throw new Error("Category is required for expenses");
    
    const [inserted] = await db.insert(expenses).values({
      userId,
      amount: toMinorUnits(data.amount),
      description: data.description || "Quick Expense",
      categoryId: data.categoryId,
      paymentMethodId: data.paymentMethodId,
      expenseDate: data.date,
    }).returning({ id: expenses.id });

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    return { success: true, id: inserted.id, type: "EXPENSE" };
  } else {
    // Income / Transfer / etc.
    const [inserted] = await db.insert(transactions).values({
      userId,
      amount: toMinorUnits(data.amount),
      notes: data.description || "Quick Income",
      type: data.type as typeof transactions.$inferInsert.type,
      paymentMethodId: data.paymentMethodId,
      transactionDate: data.date,
    }).returning({ id: transactions.id });

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    return { success: true, id: inserted.id, type: data.type };
  }
}
