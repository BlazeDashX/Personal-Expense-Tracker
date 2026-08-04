// file: features/meals/queries/get-meals.ts
import { db } from "@/db";
import { meals, userPreferences } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function getMealsData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const [records, prefs] = await Promise.all([
    db.query.meals.findMany({
      where: eq(meals.userId, userId),
      orderBy: [desc(meals.mealDate)],
    }),
    db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    }),
  ]);

  return {
    meals: records,
    target: prefs?.mealTarget || 3,
  };
}

export async function getMeals() {
  const { meals } = await getMealsData();
  return meals;
}