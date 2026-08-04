// file: features/onboarding/actions/onboarding-actions.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { userPreferences, paymentMethods, monthlyBudgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { toMinorUnits } from "@/lib/finance";
import { format } from "date-fns";

export async function completeOnboardingStep1(data: { name: string; icon?: string; color?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    const existing = await db.query.paymentMethods.findFirst({
      where: and(eq(paymentMethods.userId, userId), eq(paymentMethods.name, data.name)),
    });

    if (!existing) {
      await db.insert(paymentMethods).values({
        userId,
        name: data.name,
        icon: data.icon || "Wallet",
        color: data.color || "#10b981",
        isDefault: true,
      });
    }

    revalidatePath("/onboarding");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to save payment method." };
  }
}

export async function completeOnboardingStep3(budgetAmount: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    if (budgetAmount > 0) {
      const budgetMonthStr = format(new Date(), "yyyy-MM");
      const minorAmount = toMinorUnits(budgetAmount);

      const existing = await db.query.monthlyBudgets.findFirst({
        where: and(eq(monthlyBudgets.userId, userId), eq(monthlyBudgets.budgetMonth, budgetMonthStr)),
      });

      if (existing) {
        await db.update(monthlyBudgets).set({ amount: minorAmount }).where(eq(monthlyBudgets.id, existing.id));
      } else {
        await db.insert(monthlyBudgets).values({
          userId,
          budgetMonth: budgetMonthStr,
          amount: minorAmount,
        });
      }
    }

    revalidatePath("/onboarding");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to save budget." };
  }
}

export async function completeOnboardingStep4(mealTarget: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    await db.update(userPreferences).set({
      mealTarget: Math.max(1, Math.min(6, mealTarget)),
    }).where(eq(userPreferences.userId, userId));

    revalidatePath("/onboarding");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to save meal target." };
  }
}

export async function finishOnboarding() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    await db.update(userPreferences).set({
      onboardingCompleted: 1,
    }).where(eq(userPreferences.userId, userId));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to finish onboarding." };
  }
}
