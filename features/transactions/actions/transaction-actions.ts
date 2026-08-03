// file: features/transactions/actions/transaction-actions.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import { transactions } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { transactionSchema, type TransactionInput } from "../schemas/transaction-schema";
import { toMinorUnits } from "@/lib/finance";

export type ActionResult = {
  success: boolean;
  error?: string;
};

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function saveTransaction(data: TransactionInput): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = transactionSchema.parse(data);
    const amountInMinorUnits = toMinorUnits(parsed.amount);

    const payload = {
      ...parsed,
      amount: amountInMinorUnits,
      userId,
      personId: ["LOAN_GIVEN", "LOAN_RECEIVED", "BORROWED", "RETURNED"].includes(parsed.type) ? parsed.personId : null,
      destinationPaymentMethodId: parsed.type === "TRANSFER" ? parsed.destinationPaymentMethodId : null,
    };

    if (parsed.id) {
      await db.update(transactions).set(payload)
        .where(and(eq(transactions.id, parsed.id), eq(transactions.userId, userId)));
    } else {
      await db.insert(transactions).values(payload);
    }

    revalidatePath("/transactions");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err?.message || "Failed to save transaction." };
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err?.message || "Failed to delete transaction." };
  }
}

export async function duplicateTransaction(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const existing = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
    });

    if (!existing) return { success: false, error: "Transaction not found." };

    await db.insert(transactions).values({
      ...existing,
      id: undefined,
      transactionDate: new Date(),
      notes: existing.notes ? `${existing.notes} (Copy)` : "(Copy)",
      createdAt: undefined,
      updatedAt: undefined,
    });

    revalidatePath("/transactions");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err?.message || "Failed to duplicate transaction." };
  }
}

export async function bulkDeleteTransactions(ids: string[]): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (ids.length === 0) return { success: false, error: "No transactions selected." };

    await db.delete(transactions).where(and(inArray(transactions.id, ids), eq(transactions.userId, userId)));
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err?.message || "Failed to delete transactions." };
  }
}