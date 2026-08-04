// file: features/budgets/actions/category-budget-actions.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { categoryBudgets } from "@/db/schema";
import { revalidatePath } from "next/cache";
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

export async function saveCategoryBudget(data: {
  id?: string;
  categoryId: string;
  amount: number;
  period?: string;
  warningThreshold?: number;
}): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const minorAmount = toMinorUnits(data.amount);
    const threshold = data.warningThreshold ?? 80;

    if (data.id) {
      await db.update(categoryBudgets).set({
        categoryId: data.categoryId,
        amount: minorAmount,
        period: data.period || "monthly",
        warningThreshold: threshold,
      }).where(and(eq(categoryBudgets.id, data.id), eq(categoryBudgets.userId, userId)));
    } else {
      // Upsert by userId and categoryId
      const existing = await db.query.categoryBudgets.findFirst({
        where: and(eq(categoryBudgets.userId, userId), eq(categoryBudgets.categoryId, data.categoryId)),
      });

      if (existing) {
        await db.update(categoryBudgets).set({
          amount: minorAmount,
          period: data.period || "monthly",
          warningThreshold: threshold,
        }).where(eq(categoryBudgets.id, existing.id));
      } else {
        await db.insert(categoryBudgets).values({
          userId,
          categoryId: data.categoryId,
          amount: minorAmount,
          period: data.period || "monthly",
          warningThreshold: threshold,
        });
      }
    }

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to save category budget." };
  }
}

export async function deleteCategoryBudget(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await db.delete(categoryBudgets).where(and(eq(categoryBudgets.id, id), eq(categoryBudgets.userId, userId)));
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to delete category budget." };
  }
}
