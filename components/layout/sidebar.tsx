"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  CalendarDays,
  Receipt,
  ArrowRightLeft,
  UtensilsCrossed,
  PieChart,
  Settings,
  WalletCards,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface NavGroup {
  label?: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Activity", href: "/activity", icon: Activity },
      { name: "Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Ledger",
    items: [
      { name: "Expenses", href: "/expenses", icon: Receipt },
      { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
      { name: "Meals", href: "/meals", icon: UtensilsCrossed },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Reports", href: "/reports", icon: PieChart },
      { name: "Budgets", href: "/budgets", icon: WalletCards },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "hidden border-r bg-muted/30 md:block relative transition-all duration-300 motion-reduce:transition-none",
        isCollapsed ? "w-20" : "w-56 lg:w-64"
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-14 items-center border-b px-4 lg:h-15",
            isCollapsed ? "justify-center px-0" : "lg:px-6"
          )}
        >
          <Link
            className={cn(
              "flex items-center gap-2.5 font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-1 py-0.5",
              isCollapsed && "justify-center"
            )}
            href="/dashboard"
          >
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <WalletCards className="h-5 w-5 shrink-0" />
            </div>
            {!isCollapsed && <span className="text-base font-bold tracking-tight">Expense Tracker</span>}
          </Link>
        </div>

        {/* Nav Groups Container */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 no-scrollbar">
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={group.label || groupIdx} className="space-y-1">
              {!isCollapsed && group.label && (
                <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                  {group.label}
                </h4>
              )}
              <nav className="grid gap-1">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;

                  const navLink = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                        isCollapsed ? "justify-center px-0" : "px-3",
                        isActive
                          ? "bg-primary/15 text-primary font-semibold border-r-2 border-primary"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "shrink-0 transition-transform",
                          isCollapsed ? "h-5 w-5" : "h-4 w-4",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger className="w-full flex justify-center">
                          {navLink}
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.name}</TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={item.href}>{navLink}</React.Fragment>;
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Toggle Button at Bottom */}
        <div className="p-3 border-t mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none",
              isCollapsed ? "px-0" : "px-3"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}