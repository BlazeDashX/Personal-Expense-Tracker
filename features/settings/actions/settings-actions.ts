// file: features/settings/actions/settings-actions.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { categories, paymentMethods, people, monthlyBudgets, userPreferences } from "@/db/schema";
import { revalidatePath } from "next/cache";
import {
  categorySchema,
  paymentMethodSchema,
  personSchema,
  budgetSchema,
  preferencesSchema,
  type CategoryFormValues,
  type PaymentMethodFormValues,
  type PersonFormValues,
  type BudgetFormValues,
  type PreferencesFormValues,
} from "../schemas/settings-schemas";
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

function handleDbError(e: unknown): ActionResult {
  const err = e as { code?: string; message?: string };
  if (err?.code === "23503") return { success: false, error: "Cannot delete because records are attached to this item." };
  if (err?.code === "23505") return { success: false, error: "A record with this identifier already exists." };
  return { success: false, error: err?.message || "An unexpected database error occurred." };
}

// --- Categories ---
export async function saveCategory(data: CategoryFormValues): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = categorySchema.parse(data);
    if (parsed.id) {
      await db.update(categories).set(parsed).where(and(eq(categories.id, parsed.id), eq(categories.userId, userId)));
    } else {
      await db.insert(categories).values({ ...parsed, userId });
    }
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return handleDbError(e);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId), eq(categories.isDefault, false)));
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return handleDbError(e);
  }
}

// --- Payment Methods ---
export async function savePaymentMethod(data: PaymentMethodFormValues): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = paymentMethodSchema.parse(data);
    if (parsed.id) {
      await db.update(paymentMethods).set(parsed).where(and(eq(paymentMethods.id, parsed.id), eq(paymentMethods.userId, userId)));
    } else {
      await db.insert(paymentMethods).values({ ...parsed, userId });
    }
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return handleDbError(e);
  }
}

export async function deletePaymentMethod(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await db.delete(paymentMethods).where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId), eq(paymentMethods.isDefault, false)));
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return handleDbError(e);
  }
}

// --- People ---
export async function savePerson(data: PersonFormValues): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = personSchema.parse(data);
    if (parsed.id) {
      await db.update(people).set(parsed).where(and(eq(people.id, parsed.id), eq(people.userId, userId)));
    } else {
      await db.insert(people).values({ ...parsed, userId });
    }
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return handleDbError(e);
  }
}

export async function createInlinePerson(name: string): Promise<{ success: boolean; person?: { id: string; name: string }; error?: string }> {
  try {
    const userId = await getUserId();
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: "Person name cannot be empty." };

    const [inserted] = await db.insert(people).values({ userId, name: trimmed }).returning({ id: people.id, name: people.name });
    revalidatePath("/settings");
    revalidatePath("/transactions");
    return { success: true, person: inserted };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to create person." };
  }
}

export async function deletePerson(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await db.delete(people).where(and(eq(people.id, id), eq(people.userId, userId)));
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return handleDbError(e);
  }
}

// --- Budgets ---
export async function saveBudget(data: BudgetFormValues): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = budgetSchema.parse(data);
    const amountInMinorUnits = toMinorUnits(parsed.amount);

    if (parsed.id) {
      await db.update(monthlyBudgets).set({ ...parsed, amount: amountInMinorUnits })
        .where(and(eq(monthlyBudgets.id, parsed.id), eq(monthlyBudgets.userId, userId)));
    } else {
      await db.insert(monthlyBudgets).values({ ...parsed, amount: amountInMinorUnits, userId });
    }
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return handleDbError(e);
  }
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await db.delete(monthlyBudgets).where(and(eq(monthlyBudgets.id, id), eq(monthlyBudgets.userId, userId)));
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return handleDbError(e);
  }
}

// --- Preferences ---
export async function savePreferences(data: PreferencesFormValues): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = preferencesSchema.parse(data);
    await db.update(userPreferences).set(parsed).where(eq(userPreferences.userId, userId));
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return handleDbError(e);
  }
}