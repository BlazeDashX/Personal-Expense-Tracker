// file: db/schema/notifications.ts
import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g. 'BUDGET_WARNING', 'SYSTEM'
  title: text("title").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  relatedEntityId: uuid("related_entity_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
