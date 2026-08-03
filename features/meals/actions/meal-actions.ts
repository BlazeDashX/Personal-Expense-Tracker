// file: features/meals/actions/meal-actions.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import { meals } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { mealSchema, type MealInput } from "../schemas/meal-schema";

export type ActionResult = {
  success?: boolean;
  error?: string;
};

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function saveMeal(data: MealInput): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = mealSchema.parse(data);
    
    // Normalize date to midnight UTC to reliably check for existing dates
    const normalizedDate = new Date(Date.UTC(
      parsed.mealDate.getFullYear(),
      parsed.mealDate.getMonth(),
      parsed.mealDate.getDate()
    ));

    // Check if a record for this exact date already exists
    const existing = await db.query.meals.findFirst({
      where: and(eq(meals.userId, userId), eq(meals.mealDate, normalizedDate)),
    });

    if (existing) {
      if (parsed.id && parsed.id !== existing.id) {
        return { error: "A meal record already exists for this date." };
      }
      
      await db.update(meals)
        .set({ mealCount: parsed.mealCount, notes: parsed.notes })
        .where(eq(meals.id, existing.id));
    } else {
      if (parsed.id) {
        await db.update(meals)
          .set({ ...parsed, mealDate: normalizedDate })
          .where(and(eq(meals.id, parsed.id), eq(meals.userId, userId)));
      } else {
        await db.insert(meals).values({
          userId,
          mealDate: normalizedDate,
          mealCount: parsed.mealCount,
          notes: parsed.notes,
        });
      }
    }

    revalidatePath("/meals");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "23505") return { error: "A meal record already exists for this date." };
    return { error: err?.message || "Failed to save meal record." };
  }
}

export async function deleteMeal(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await db.delete(meals).where(and(eq(meals.id, id), eq(meals.userId, userId)));
    revalidatePath("/meals");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err?.message || "Failed to delete meal." };
  }
}

export async function bulkDeleteMeals(ids: string[]): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (ids.length === 0) return { error: "No meals selected." };
    
    await db.delete(meals).where(and(inArray(meals.id, ids), eq(meals.userId, userId)));
    revalidatePath("/meals");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err?.message || "Failed to delete meals." };
  }
}