// file: features/onboarding/queries/get-onboarding.ts
import { db } from "@/db";
import { userPreferences, paymentMethods, categories, monthlyBudgets, expenses } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { format } from "date-fns";
import { fromMinorUnits } from "@/lib/finance";

let isColumnEnsured = false;

export async function ensureOnboardingColumn() {
  if (isColumnEnsured) return;
  try {
    await db.execute(
      sql`ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS onboarding_completed INTEGER NOT NULL DEFAULT 0;`
    );
    isColumnEnsured = true;
  } catch (e) {
    console.error("Column alter warning:", e);
  }
}

export async function checkNewUserStatus() {
  const session = await auth();
  if (!session?.user?.id) return { isNewUser: false };
  const userId = session.user.id;

  await ensureOnboardingColumn();

  let prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  if (!prefs) {
    const [inserted] = await db
      .insert(userPreferences)
      .values({
        userId,
        currencyCode: "BDT",
        weekStartsOn: "0",
        mealTarget: 3,
        onboardingCompleted: 0,
      })
      .returning();
    prefs = inserted;
  }

  // Check if onboarding is complete
  if (prefs.onboardingCompleted === 1) {
    return { isNewUser: false, prefs };
  }

  // Cheapest computation check: 0 payment methods AND 0 expenses
  const [pms, exps] = await Promise.all([
    db.query.paymentMethods.findMany({ where: eq(paymentMethods.userId, userId), limit: 1 }),
    db.query.expenses.findMany({ where: eq(expenses.userId, userId), limit: 1 }),
  ]);

  const isNewUser = pms.length === 0 && exps.length === 0;
  return { isNewUser, prefs };
}

export async function getOnboardingData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  await ensureOnboardingColumn();

  const currentMonthStr = format(new Date(), "yyyy-MM");

  const [prefs, pms, cats, budget] = await Promise.all([
    db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) }),
    db.query.paymentMethods.findMany({ where: eq(paymentMethods.userId, userId) }),
    db.query.categories.findMany({ where: eq(categories.userId, userId) }),
    db.query.monthlyBudgets.findFirst({
      where: and(eq(monthlyBudgets.userId, userId), eq(monthlyBudgets.budgetMonth, currentMonthStr)),
    }),
  ]);

  return {
    prefs: prefs || { currencyCode: "BDT", mealTarget: 3, onboardingCompleted: 0 },
    paymentMethods: pms.map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: p.color })),
    categories: cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, isDefault: c.isDefault })),
    budgetAmount: budget ? fromMinorUnits(budget.amount) : 0,
  };
}

export type OnboardingData = Awaited<ReturnType<typeof getOnboardingData>>;
