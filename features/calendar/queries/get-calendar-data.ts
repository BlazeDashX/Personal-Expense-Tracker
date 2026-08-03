// file: features/calendar/queries/get-calendar-data.ts
import { db } from "@/db";
import { expenses, transactions, meals } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
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

export type CalendarData = Awaited<ReturnType<typeof getCalendarData>>;