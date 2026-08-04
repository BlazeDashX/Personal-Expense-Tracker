"use server";

import { db } from "@/db";
import { meals } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function incrementMealCount(dateStr: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const existing = await db.query.meals.findFirst({
    where: and(eq(meals.userId, userId), eq(meals.mealDate, targetDate)),
  });

  if (existing) {
    await db.update(meals)
      .set({ mealCount: existing.mealCount + 1 })
      .where(eq(meals.id, existing.id));
  } else {
    await db.insert(meals).values({
      userId,
      mealDate: targetDate,
      mealCount: 1,
    });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function decrementMealCount(dateStr: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const existing = await db.query.meals.findFirst({
    where: and(eq(meals.userId, userId), eq(meals.mealDate, targetDate)),
  });

  if (existing && existing.mealCount > 0) {
    await db.update(meals)
      .set({ mealCount: existing.mealCount - 1 })
      .where(eq(meals.id, existing.id));
  }

  revalidatePath("/dashboard");
  return { success: true };
}
