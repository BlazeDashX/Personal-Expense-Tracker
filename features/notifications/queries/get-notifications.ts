// file: features/notifications/queries/get-notifications.ts
import { db } from "@/db";
import { notifications, categoryBudgets, expenses, categories } from "@/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth } from "date-fns";
import { fromMinorUnits, formatMoney, toMinorUnits } from "@/lib/finance";

let isTableEnsured = false;

export async function ensureNotificationsTable() {
  if (isTableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        related_entity_id UUID,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    isTableEnsured = true;
  } catch (e) {
    console.error("Notifications table check warning:", e);
  }
}

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  await ensureNotificationsTable();

  const userNotifs = await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
    limit: 20,
  });

  return userNotifs;
}

export async function checkAndGenerateBudgetNotification(userId: string, categoryId: string) {
  try {
    await ensureNotificationsTable();

    // 1. Check if category has a category_budget
    const catBudget = await db.query.categoryBudgets.findFirst({
      where: and(eq(categoryBudgets.userId, userId), eq(categoryBudgets.categoryId, categoryId)),
      with: { category: true },
    });

    if (!catBudget) return;

    // 2. Compute current month's MTD expenses for this category
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const categoryExpenses = await db.query.expenses.findMany({
      where: and(
        eq(expenses.userId, userId),
        eq(expenses.categoryId, categoryId),
        gte(expenses.expenseDate, currentMonthStart),
        lte(expenses.expenseDate, currentMonthEnd)
      ),
    });

    const totalSpentMajor = categoryExpenses.reduce((sum, e) => sum + fromMinorUnits(e.amount), 0);
    const budgetAmountMajor = fromMinorUnits(catBudget.amount);

    if (budgetAmountMajor <= 0) return;

    const percentage = Math.round((totalSpentMajor / budgetAmountMajor) * 100);

    // 3. Check if percentage crosses warning threshold
    if (percentage >= catBudget.warningThreshold) {
      // Check if a warning notification was already sent this month for this category to avoid spam
      const existingThisMonth = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.userId, userId),
          eq(notifications.type, "BUDGET_WARNING"),
          eq(notifications.relatedEntityId, categoryId),
          gte(notifications.createdAt, currentMonthStart)
        ),
      });

      if (!existingThisMonth) {
        const catName = catBudget.category?.name || "Category";
        await db.insert(notifications).values({
          userId,
          type: "BUDGET_WARNING",
          title: `⚠️ Budget Warning: ${catName}`,
          body: `You've used ${percentage}% of your ${formatMoney(toMinorUnits(budgetAmountMajor))} budget for ${catName}.`,
          relatedEntityId: categoryId,
        });
      }
    }
  } catch (e) {
    console.error("Failed to check/generate budget notification:", e);
  }
}
