// file: features/reports/queries/get-report-data.ts
import { db } from "@/db";
import { expenses, transactions, meals } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { format, eachDayOfInterval } from "date-fns";
import { fromMinorUnits } from "@/lib/finance";

export async function getReportData(startDate: Date, endDate: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const [rawExpenses, rawTransactions, rawMeals] = await Promise.all([
    db.query.expenses.findMany({
      where: and(eq(expenses.userId, userId), gte(expenses.expenseDate, startDate), lte(expenses.expenseDate, endDate)),
      with: { category: true, paymentMethod: true },
      orderBy: [desc(expenses.expenseDate)],
    }),
    db.query.transactions.findMany({
      where: and(eq(transactions.userId, userId), gte(transactions.transactionDate, startDate), lte(transactions.transactionDate, endDate)),
      with: { paymentMethod: true },
    }),
    db.query.meals.findMany({
      where: and(eq(meals.userId, userId), gte(meals.mealDate, startDate), lte(meals.mealDate, endDate)),
    }),
  ]);

  // Aggregate Category Data
  const categoryMap = new Map<string, { name: string; value: number; color: string }>();
  let totalExpense = 0;

  rawExpenses.forEach((exp) => {
    const amount = fromMinorUnits(exp.amount);
    totalExpense += amount;

    const existing = categoryMap.get(exp.categoryId);
    if (existing) {
      existing.value += amount;
    } else {
      categoryMap.set(exp.categoryId, {
        name: exp.category.name,
        value: amount,
        color: exp.category.color,
      });
    }
  });

  const expenseByCategory = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  const highestCategory = expenseByCategory[0] || null;

  // Aggregate Daily Trend
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const trendData = days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");

    // Daily Expense
    const dayExpenses = rawExpenses.filter((e) => format(new Date(e.expenseDate), "yyyy-MM-dd") === dateStr);
    const dayTotal = dayExpenses.reduce((sum, e) => sum + fromMinorUnits(e.amount), 0);

    // Daily Meals
    const dayMeal = rawMeals.find((m) => format(new Date(m.mealDate), "yyyy-MM-dd") === dateStr);

    return {
      date: format(day, "MMM dd"),
      fullDate: dateStr,
      expense: dayTotal,
      meals: dayMeal ? dayMeal.mealCount : 0,
    };
  });

  const highestSpendingDay = [...trendData].sort((a, b) => b.expense - a.expense)[0] || null;
  const averageDaily = trendData.length > 0 ? totalExpense / trendData.length : 0;
  const totalMeals = rawMeals.reduce((sum, m) => sum + m.mealCount, 0);

  // Cash Flow
  let cashIn = 0;
  let cashOut = 0;

  rawTransactions.forEach((txn) => {
    const amount = fromMinorUnits(txn.amount);
    if (["CASH_IN", "LOAN_RECEIVED", "BORROWED"].includes(txn.type)) cashIn += amount;
    if (["CASH_OUT", "LOAN_GIVEN", "RETURNED"].includes(txn.type)) cashOut += amount;
  });

  return {
    metrics: {
      totalExpense,
      averageDaily,
      cashIn,
      cashOut,
      netFlow: cashIn - cashOut - totalExpense,
      totalMeals,
      highestCategory: highestCategory ? highestCategory.name : "N/A",
      highestSpendingDay: highestSpendingDay && highestSpendingDay.expense > 0 ? highestSpendingDay.fullDate : "N/A",
      transactionCount: rawTransactions.length,
    },
    expenseByCategory,
    trendData,
    cashFlowData: [
      { name: "Cash In", amount: cashIn, fill: "#10b981" },
      { name: "Cash Out", amount: cashOut, fill: "#ef4444" },
      { name: "Expenses", amount: totalExpense, fill: "#f59e0b" },
    ],
  };
}

export type ReportData = Awaited<ReturnType<typeof getReportData>>;