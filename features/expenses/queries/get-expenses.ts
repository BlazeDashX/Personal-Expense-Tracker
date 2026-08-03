// file: features/expenses/queries/get-expenses.ts
import { db } from "@/db";
import { expenses, categories, paymentMethods } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { fromMinorUnits } from "@/lib/finance";

export async function getExpenses() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = await db
    .select({
      id: expenses.id,
      expenseDate: expenses.expenseDate,
      amount: expenses.amount,
      description: expenses.description,
      notes: expenses.notes,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
      },
      paymentMethod: {
        id: paymentMethods.id,
        name: paymentMethods.name,
        color: paymentMethods.color,
        icon: paymentMethods.icon,
      },
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .innerJoin(paymentMethods, eq(expenses.paymentMethodId, paymentMethods.id))
    .where(eq(expenses.userId, session.user.id))
    .orderBy(desc(expenses.expenseDate));

  // Convert minor units to decimal for the UI
  return data.map((exp) => ({
    ...exp,
    amount: fromMinorUnits(exp.amount),
  }));
}

export async function getExpenseLookups() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [cats, pms] = await Promise.all([
    db.query.categories.findMany({ where: eq(categories.userId, session.user.id) }),
    db.query.paymentMethods.findMany({ where: eq(paymentMethods.userId, session.user.id) }),
  ]);

  return { categories: cats, paymentMethods: pms };
}