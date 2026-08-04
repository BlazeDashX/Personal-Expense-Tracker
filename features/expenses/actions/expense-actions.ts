// file: features/expenses/actions/expense-actions.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import { expenses } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { expenseSchema, type ExpenseInput } from "../schemas/expense-schema";
import { toMinorUnits } from "@/lib/finance";
import { checkAndGenerateBudgetNotification } from "@/features/notifications/queries/get-notifications";

export type ActionResult = {
  success: boolean;
  error?: string;
};

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function saveExpense(data: ExpenseInput): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = expenseSchema.parse(data);
    const amountInMinorUnits = toMinorUnits(parsed.amount);

    if (parsed.id) {
      await db
        .update(expenses)
        .set({ ...parsed, amount: amountInMinorUnits })
        .where(and(eq(expenses.id, parsed.id), eq(expenses.userId, userId)));
    } else {
      await db.insert(expenses).values({ ...parsed, amount: amountInMinorUnits, userId });
    }

    // Trigger budget warning threshold check
    await checkAndGenerateBudgetNotification(userId, parsed.categoryId);

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err?.message || "Failed to save expense." };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    revalidatePath("/expenses");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err?.message || "Failed to delete expense." };
  }
}

export async function duplicateExpense(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const existing = await db.query.expenses.findFirst({
      where: and(eq(expenses.id, id), eq(expenses.userId, userId)),
    });

    if (!existing) return { success: false, error: "Expense not found." };

    await db.insert(expenses).values({
      userId,
      expenseDate: new Date(), // Set to today
      categoryId: existing.categoryId,
      paymentMethodId: existing.paymentMethodId,
      amount: existing.amount,
      description: `${existing.description} (Copy)`,
      notes: existing.notes,
    });

    revalidatePath("/expenses");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err?.message || "Failed to duplicate expense." };
  }
}

export async function bulkDeleteExpenses(ids: string[]): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (ids.length === 0) return { success: false, error: "No expenses selected." };

    await db.delete(expenses).where(and(inArray(expenses.id, ids), eq(expenses.userId, userId)));
    revalidatePath("/expenses");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err?.message || "Failed to delete expenses." };
  }
}