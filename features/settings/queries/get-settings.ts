// file: features/settings/queries/get-settings.ts
import { db } from "@/db";
import { eq, desc, asc } from "drizzle-orm";
import { categories, paymentMethods, people, monthlyBudgets, userPreferences, quickShortcuts } from "@/db/schema";
import { auth } from "@/auth";

export async function getSettingsData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const [cats, pms, ppl, budgets, prefs, shortcuts] = await Promise.all([
    db.query.categories.findMany({ where: eq(categories.userId, userId) }),
    db.query.paymentMethods.findMany({ where: eq(paymentMethods.userId, userId) }),
    db.query.people.findMany({ where: eq(people.userId, userId) }),
    db.query.monthlyBudgets.findMany({ 
      where: eq(monthlyBudgets.userId, userId),
      orderBy: [desc(monthlyBudgets.budgetMonth)] 
    }),
    db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) }),
    db.query.quickShortcuts.findMany({
      where: eq(quickShortcuts.userId, userId),
      orderBy: [asc(quickShortcuts.orderIndex)],
      with: { category: true, paymentMethod: true },
    }),
  ]);

  return {
    categories: cats,
    paymentMethods: pms,
    people: ppl,
    budgets,
    preferences: prefs,
    shortcuts,
  };
}