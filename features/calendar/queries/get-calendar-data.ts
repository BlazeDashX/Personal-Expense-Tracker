// file: features/calendar/queries/get-calendar-data.ts
import { db } from "@/db";
import { expenses, transactions, meals, monthlyBudgets, categories, paymentMethods, people } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from "date-fns";
import { fromMinorUnits } from "@/lib/finance";

export async function getCalendarData(targetMonth: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const firstDayOfMonth = startOfMonth(targetMonth);
  const lastDayOfMonth = endOfMonth(targetMonth);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // 0 = Sunday
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });

  const [monthlyExpenses, monthlyTransactions, monthlyMeals] = await Promise.all([
    db.query.expenses.findMany({
      where: and(eq(expenses.userId, userId), gte(expenses.expenseDate, startDate), lte(expenses.expenseDate, endDate)),
      with: { category: true, paymentMethod: true },
    }),
    db.query.transactions.findMany({
      where: and(eq(transactions.userId, userId), gte(transactions.transactionDate, startDate), lte(transactions.transactionDate, endDate)),
      with: { paymentMethod: true, destinationPaymentMethod: true, person: true },
    }),
    db.query.meals.findMany({
      where: and(eq(meals.userId, userId), gte(meals.mealDate, startDate), lte(meals.mealDate, endDate)),
    }),
  ]);

  return {
    expenses: monthlyExpenses.map(e => ({ ...e, amount: fromMinorUnits(e.amount) })),
    transactions: monthlyTransactions.map(t => ({ ...t, amount: fromMinorUnits(t.amount) })),
    meals: monthlyMeals,
  };
}

export async function getCalendarPageData(targetMonth: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const firstDayOfMonth = startOfMonth(targetMonth);
  const lastDayOfMonth = endOfMonth(targetMonth);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });
  const budgetMonthStr = format(targetMonth, "yyyy-MM");

  const [monthlyExpenses, monthlyTransactions, monthlyMeals, budgetResult, cats, pms, ppl] = await Promise.all([
    db.query.expenses.findMany({
      where: and(eq(expenses.userId, userId), gte(expenses.expenseDate, startDate), lte(expenses.expenseDate, endDate)),
      with: { category: true, paymentMethod: true },
    }),
    db.query.transactions.findMany({
      where: and(eq(transactions.userId, userId), gte(transactions.transactionDate, startDate), lte(transactions.transactionDate, endDate)),
      with: { paymentMethod: true, destinationPaymentMethod: true, person: true },
    }),
    db.query.meals.findMany({
      where: and(eq(meals.userId, userId), gte(meals.mealDate, startDate), lte(meals.mealDate, endDate)),
    }),
    db.query.monthlyBudgets.findFirst({
      where: and(eq(monthlyBudgets.userId, userId), eq(monthlyBudgets.budgetMonth, budgetMonthStr)),
    }),
    db.query.categories.findMany({ where: eq(categories.userId, userId) }),
    db.query.paymentMethods.findMany({ where: eq(paymentMethods.userId, userId) }),
    db.query.people.findMany({ where: eq(people.userId, userId) }),
  ]);

  return {
    calendar: {
      expenses: monthlyExpenses.map(e => ({ ...e, amount: fromMinorUnits(e.amount) })),
      transactions: monthlyTransactions.map(t => ({ ...t, amount: fromMinorUnits(t.amount) })),
      meals: monthlyMeals,
    },
    budgetAmount: budgetResult ? fromMinorUnits(Number(budgetResult.amount)) : 0,
    lookups: {
      categories: cats,
      paymentMethods: pms,
      people: ppl,
    },
  };
}

export type CalendarData = Awaited<ReturnType<typeof getCalendarData>>;