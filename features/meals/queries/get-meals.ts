// file: features/meals/queries/get-meals.ts
import { db } from "@/db";
import { meals } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function getMeals() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = await db.query.meals.findMany({
    where: eq(meals.userId, session.user.id),
    orderBy: [desc(meals.mealDate)],
  });

  return data;
}