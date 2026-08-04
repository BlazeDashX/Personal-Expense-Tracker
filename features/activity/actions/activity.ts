"use server";

import { db } from "@/db";
import { expenses, transactions } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteActivity(id: string, type: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  if (type === "EXPENSE") {
    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  } else {
    await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  }

  revalidatePath("/activity");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateActivity(
  id: string, 
  type: string, 
  data: {
    amount: number;
    description: string;
    date: Date;
    categoryId?: string;
    paymentMethodId: string;
    personId?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Amount arrives in major units from the UI, we must store it in minor units
  const amountMinor = Math.round(data.amount * 100);

  if (type === "EXPENSE") {
    await db.update(expenses)
      .set({
        amount: amountMinor,
        description: data.description,
        expenseDate: data.date,
        categoryId: data.categoryId ?? undefined,
        paymentMethodId: data.paymentMethodId,
        updatedAt: new Date()
      })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  } else {
    await db.update(transactions)
      .set({
        amount: amountMinor,
        notes: data.description,
        transactionDate: data.date,
        paymentMethodId: data.paymentMethodId,
        personId: data.personId ?? undefined,
        updatedAt: new Date()
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  }

  revalidatePath("/activity");
  revalidatePath("/dashboard");
  return { success: true };
}
