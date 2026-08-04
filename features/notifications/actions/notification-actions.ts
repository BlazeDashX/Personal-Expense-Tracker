// file: features/notifications/actions/notification-actions.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to mark as read." };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to mark all as read." };
  }
}

export async function deleteNotification(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    await db.delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Failed to delete notification." };
  }
}
