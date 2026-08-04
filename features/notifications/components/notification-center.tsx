"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Bell, CheckCheck, CheckCircle2, Trash2, AlertTriangle, ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "../actions/notification-actions";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  relatedEntityId?: string | null;
  createdAt: Date;
}

export function NotificationCenter({ initialNotifications = [] }: { initialNotifications?: NotificationItem[] }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsAsRead();
      if (res.error) toast.error(res.error);
      else {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read.");
      }
    });
  };

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationAsRead(id);
      if (res.error) toast.error(res.error);
      else {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteNotification(id);
      if (res.error) toast.error(res.error);
      else {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="relative inline-flex items-center justify-center rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border/80">
        <Bell className="h-4 w-4 shrink-0 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-80 sm:w-96 p-0 rounded-2xl bg-popover shadow-xl border" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List / 5. Empty State */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-foreground">You&apos;re all caught up!</h4>
                <p className="text-xs text-muted-foreground">No new budget warnings or alerts.</p>
              </div>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-3 rounded-xl border transition-colors flex flex-col gap-2 relative",
                  !item.isRead ? "bg-primary/5 border-primary/20" : "bg-card border-border/50 opacity-80"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0 mt-0.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground leading-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.body}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id)}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                      title="Delete notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
                  <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                  <Link
                    href="/budgets"
                    onClick={() => {
                      if (!item.isRead) handleMarkAsRead(item.id);
                      setIsOpen(false);
                    }}
                    className="text-primary font-bold hover:underline flex items-center gap-1 font-sans"
                  >
                    <span>View Budget</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
