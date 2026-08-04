// file: features/dashboard/queries/get-metrics.ts
import { db } from "@/db";
import { expenses, transactions, meals, monthlyBudgets, categories, paymentMethods, people, quickShortcuts, userPreferences } from "@/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay } from "date-fns";
import { fromMinorUnits } from "@/lib/finance";
import { ensureOnboardingColumn } from "@/features/onboarding/queries/get-onboarding";

export async function getDashboardMetrics() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));
  const currentBudgetMonth = format(now, "yyyy-MM");

  // 1. Total Expenses (Current Month)
  const currentMonthExpensesResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), gte(expenses.expenseDate, currentMonthStart), lte(expenses.expenseDate, currentMonthEnd)));
  const currentMonthExpenseTotal = Number(currentMonthExpensesResult[0]?.total || 0);

  // 2. Total Expenses (Previous Month)
  const prevMonthExpensesResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), gte(expenses.expenseDate, prevMonthStart), lte(expenses.expenseDate, prevMonthEnd)));
  const prevMonthExpenseTotal = Number(prevMonthExpensesResult[0]?.total || 0);

  // 3. Lifetime Cash In
  const cashInResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      sql`${transactions.type} IN ('CASH_IN', 'LOAN_RECEIVED', 'BORROWED')`
    ));
  const lifetimeCashIn = Number(cashInResult[0]?.total || 0);

  // 4. Lifetime Cash Out
  const cashOutResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      sql`${transactions.type} IN ('CASH_OUT', 'LOAN_GIVEN', 'RETURNED')`
    ));
  const lifetimeCashOut = Number(cashOutResult[0]?.total || 0);

  // 5. Lifetime Total Expenses (For Balance Calculation)
  const lifetimeExpensesResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
    .from(expenses)
    .where(eq(expenses.userId, userId));
  const lifetimeExpenseTotal = Number(lifetimeExpensesResult[0]?.total || 0);

  // 6. Current Month Meals
  const mealsResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${meals.mealCount}), 0)` })
    .from(meals)
    .where(and(eq(meals.userId, userId), gte(meals.mealDate, currentMonthStart), lte(meals.mealDate, currentMonthEnd)));
  const currentMonthMeals = Number(mealsResult[0]?.total || 0);

  // 6b. Today's Meals
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const todayMealsResult = await db
    .select({ count: meals.mealCount })
    .from(meals)
    .where(and(eq(meals.userId, userId), gte(meals.mealDate, todayStart), lte(meals.mealDate, todayEnd)));
  const todayMeals = todayMealsResult[0]?.count || 0;

  // 7. Monthly Budget
  const budgetResult = await db.query.monthlyBudgets.findFirst({
    where: and(eq(monthlyBudgets.userId, userId), eq(monthlyBudgets.budgetMonth, currentBudgetMonth)),
  });
  const budgetAmount = budgetResult ? Number(budgetResult.amount) : 0;

  // 8. Recent Activity (Last 5 Expenses)
  const recentActivity = await db.query.expenses.findMany({
    where: eq(expenses.userId, userId),
    orderBy: [desc(expenses.createdAt)],
    limit: 5,
    with: { category: true, paymentMethod: true }
  });

  // Calculate Derived Metrics
  const currentBalance = lifetimeCashIn - lifetimeCashOut - lifetimeExpenseTotal;
  const elapsedDays = now.getDate();
  const averageDaily = elapsedDays > 0 ? currentMonthExpenseTotal / elapsedDays : 0;
  
  let previousMonthComparison = 0;
  if (prevMonthExpenseTotal > 0) {
    previousMonthComparison = ((currentMonthExpenseTotal - prevMonthExpenseTotal) / prevMonthExpenseTotal) * 100;
  }

  return {
    currentBalance: fromMinorUnits(currentBalance),
    monthlyExpense: fromMinorUnits(currentMonthExpenseTotal),
    budgetAmount: fromMinorUnits(budgetAmount),
    cashIn: fromMinorUnits(lifetimeCashIn),
    cashOut: fromMinorUnits(lifetimeCashOut),
    totalMeals: currentMonthMeals,
    todayMeals,
    averageDaily: fromMinorUnits(averageDaily),
    previousMonthComparison,
    recentActivity: recentActivity.map(exp => ({ ...exp, amount: fromMinorUnits(exp.amount) })),
  };
}

// Fetch lookups for the Quick Add Modals
export async function getDashboardLookups() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  await ensureOnboardingColumn();

  const [cats, pms, ppl, initialShortcuts, prefs] = await Promise.all([
    db.query.categories.findMany({ where: eq(categories.userId, userId) }),
    db.query.paymentMethods.findMany({ where: eq(paymentMethods.userId, userId) }),
    db.query.people.findMany({ where: eq(people.userId, userId) }),
    db.query.quickShortcuts.findMany({ where: eq(quickShortcuts.userId, userId), orderBy: [quickShortcuts.orderIndex] }),
    db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) })
  ]);
  
  let shortcuts = initialShortcuts;

  // Provide sensible defaults if user has no shortcuts yet
  if (shortcuts.length === 0 && cats.length > 0 && pms.length > 0) {
    const foodCat = cats.find(c => c.name.toLowerCase().includes("food")) || cats[0];
    const snackCat = cats.find(c => c.name.toLowerCase().includes("snack")) || foodCat;
    const travelCat = cats.find(c => c.name.toLowerCase().includes("travel") || c.name.toLowerCase().includes("transport")) || cats[0];
    const defaultPm = pms[0];

    shortcuts = [
      { id: "def-1", userId, type: "EXPENSE", title: "Tea & Snacks", amount: 4000, categoryId: snackCat.id, paymentMethodId: defaultPm.id, transactionType: null, icon: "Coffee", color: null, orderIndex: 0, instantMode: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: "def-2", userId, type: "EXPENSE", title: "Lunch", amount: 15000, categoryId: foodCat.id, paymentMethodId: defaultPm.id, transactionType: null, icon: "Utensils", color: null, orderIndex: 1, instantMode: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: "def-3", userId, type: "EXPENSE", title: "Rickshaw/Bus", amount: 5000, categoryId: travelCat.id, paymentMethodId: defaultPm.id, transactionType: null, icon: "Bus", color: null, orderIndex: 2, instantMode: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: "def-4", userId, type: "EXPENSE", title: "Dinner", amount: 20000, categoryId: foodCat.id, paymentMethodId: defaultPm.id, transactionType: null, icon: "UtensilsCrossed", color: null, orderIndex: 3, instantMode: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: "def-5", userId, type: "TRANSACTION", title: "Cash Received", amount: 100000, categoryId: null, paymentMethodId: defaultPm.id, transactionType: "CASH_IN", icon: "Banknote", color: null, orderIndex: 4, instantMode: 0, createdAt: new Date(), updatedAt: new Date() }
    ];
  }

  return {
    categories: cats,
    paymentMethods: pms,
    people: ppl,
    shortcuts,
    userPreferences: prefs
  };
}