"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "../shared/theme-toggle";
import { GlobalAddMenu } from "./global-add-menu";
import { Button } from "@/components/ui/button";
import { NotificationCenter, type NotificationItem } from "@/features/notifications/components/notification-center";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface HeaderProps {
  user: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
    image?: string | null;
  };
  categories?: LookupItem[];
  paymentMethods?: LookupItem[];
  people?: LookupItem[];
  notifications?: NotificationItem[];
  onOpenCommandPalette?: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Financial overview & stats" },
  "/activity": { title: "Activity Log", subtitle: "Recent transactions & history" },
  "/calendar": { title: "Financial Calendar", subtitle: "Daily breakdown & meal tracking" },
  "/expenses": { title: "Expenses", subtitle: "Category breakdown & logs" },
  "/transactions": { title: "Transactions", subtitle: "Cash in, loans & transfers" },
  "/meals": { title: "Meal Tracker", subtitle: "Mess & daily meal counts" },
  "/reports": { title: "Reports & Analytics", subtitle: "Visual insights & cash flow" },
  "/budgets": { title: "Budgets & Limits", subtitle: "Spending targets & warning limits" },
  "/people": { title: "People & Debts", subtitle: "Informal loans & debt tracking" },
  "/settings": { title: "Settings", subtitle: "Categories, payment methods & profile" },
};

export function Header({
  user,
  categories = [],
  paymentMethods = [],
  people = [],
  notifications = [],
  onOpenCommandPalette,
}: HeaderProps) {
  const pathname = usePathname();

  // Find matching title or default to segment capitalization
  let currentInfo = ROUTE_TITLES[pathname];
  if (!currentInfo) {
    const matchingKey = Object.keys(ROUTE_TITLES).find((key) => pathname.startsWith(key));
    if (matchingKey) {
      currentInfo = ROUTE_TITLES[matchingKey];
    } else {
      const segment = pathname.split("/").filter(Boolean).pop() || "Dashboard";
      const formattedTitle = segment.charAt(0).toUpperCase() + segment.slice(1);
      currentInfo = { title: formattedTitle };
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-muted/30 px-4 lg:h-15 lg:px-6">
      {/* Page Title / Breadcrumb Area */}
      <div className="flex flex-col justify-center">
        <h1 className="text-base lg:text-lg font-bold tracking-tight text-foreground leading-tight">
          {currentInfo.title}
        </h1>
        {currentInfo.subtitle && (
          <p className="hidden sm:block text-xs text-muted-foreground">
            {currentInfo.subtitle}
          </p>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Command Palette Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCommandPalette}
          className="h-9 px-2.5 sm:px-3 text-muted-foreground hover:text-foreground hover:bg-muted/70 gap-2 border-border/80 focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          <Search className="h-4 w-4 shrink-0 text-primary" />
          <span className="hidden sm:inline-block text-xs font-medium">Search</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <span>⌘K</span>
          </kbd>
        </Button>

        {/* Add Menu */}
        <div className="hidden md:block">
          <GlobalAddMenu categories={categories} paymentMethods={paymentMethods} people={people} />
        </div>

        {/* Notification Bell Center */}
        <NotificationCenter initialNotifications={notifications} />

        <ThemeToggle />
        <UserNav user={user} />
      </div>
    </header>
  );
}