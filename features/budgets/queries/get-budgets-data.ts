// file: features/budgets/queries/get-budgets-data.ts
import { db } from "@/db";
import { categories, monthlyBudgets, categoryBudgets, expenses } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { fromMinorUnits } from "@/lib/finance";

export async function getBudgetsPageData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const budgetMonthStr = format(now, "yyyy-MM");

  const [allCategories, currentMonthlyBudget, catBudgets, currentExpenses] = await Promise.all([
    db.query.categories.findMany({ where: eq(categories.userId, userId) }),
    db.query.monthlyBudgets.findFirst({
      where: and(eq(monthlyBudgets.userId, userId), eq(monthlyBudgets.budgetMonth, budgetMonthStr)),
    }),
    db.query.categoryBudgets.findMany({
      where: eq(categoryBudgets.userId, userId),
      with: { category: true },
    }),
    db.query.expenses.findMany({
      where: and(eq(expenses.userId, userId), gte(expenses.expenseDate, currentMonthStart), lte(expenses.expenseDate, currentMonthEnd)),
    }),
  ]);

  // Total Month Spent
  const totalMonthSpent = currentExpenses.reduce((sum, e) => sum + fromMinorUnits(e.amount), 0);

  // Group spent by category ID
  const spentByCategoryId = new Map<string, number>();
  currentExpenses.forEach((exp) => {
    const amount = fromMinorUnits(exp.amount);
    spentByCategoryId.set(exp.categoryId, (spentByCategoryId.get(exp.categoryId) || 0) + amount);
  });

  // Map category budgets with progress and warning thresholds
  const budgetedCategoryIds = new Set(catBudgets.map((b) => b.categoryId));

  const budgetedCards = catBudgets.map((cb) => {
    const spent = spentByCategoryId.get(cb.categoryId) || 0;
    const budgeted = fromMinorUnits(cb.amount);
    const percentage = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
    const isWarning = percentage >= cb.warningThreshold;
    const isExceeded = percentage >= 100;

    return {
      id: cb.id,
      categoryId: cb.categoryId,
      categoryName: cb.category.name,
      categoryIcon: cb.category.icon,
      categoryColor: cb.category.color,
      amount: budgeted,
      spent,
      period: cb.period,
      warningThreshold: cb.warningThreshold,
      percentage,
      isWarning,
      isExceeded,
    };
  });

  // Unbudgeted categories list
  const unbudgetedCategories = allCategories.filter((c) => !budgetedCategoryIds.has(c.id));

  return {
    categories: allCategories,
    monthlyBudget: currentMonthlyBudget ? {
      id: currentMonthlyBudget.id,
      amount: fromMinorUnits(currentMonthlyBudget.amount),
      budgetMonth: currentMonthlyBudget.budgetMonth,
    } : null,
    totalMonthSpent,
    budgetedCards,
    unbudgetedCategories,
  };
}

export type BudgetsPageData = Awaited<ReturnType<typeof getBudgetsPageData>>;
