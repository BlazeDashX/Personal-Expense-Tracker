"use client";

import React, { useMemo, useState } from "react";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import * as Icons from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Inbox,
  Calendar,
} from "lucide-react";
import { EditActivitySheet } from "../../forms/components/edit-activity-sheet";
import { toMinorUnits } from "@/lib/finance";
import { Amount } from "@/components/shared/amount";
import { GlobalAddMenu } from "@/components/layout/global-add-menu";
import { toast } from "sonner";
import { deleteActivity } from "../actions/activity";
import type { UnifiedActivity } from "../queries/get-activity";
import { cn } from "@/lib/utils";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  EXPENSE: "Expense",
  CASH_IN: "Cash in",
  CASH_OUT: "Cash out",
  LOAN_GIVEN: "Loan given",
  LOAN_RECEIVED: "Loan received",
  BORROWED: "Borrowed",
  RETURNED: "Refund / Returned",
  TRANSFER: "Transfer",
};

type TypeFilter = "ALL" | "EXPENSES" | "TRANSACTIONS";
type DateFilter = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";

function groupActivity(data: UnifiedActivity[]) {
  const groups: Record<string, UnifiedActivity[]> = {
    Today: [],
    Yesterday: [],
    "Earlier this week": [],
    "Earlier this month": [],
    Older: [],
  };

  data.forEach((item) => {
    const d = new Date(item.date);
    if (isToday(d)) groups["Today"].push(item);
    else if (isYesterday(d)) groups["Yesterday"].push(item);
    else if (isThisWeek(d, { weekStartsOn: 0 })) groups["Earlier this week"].push(item);
    else if (isThisMonth(d)) groups["Earlier this month"].push(item);
    else groups["Older"].push(item);
  });

  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

export function ActivityFeed({
  data = [],
  categories = [],
  paymentMethods = [],
  people = [],
  showFilterBar = true,
}: {
  data: UnifiedActivity[];
  categories?: LookupItem[];
  paymentMethods?: LookupItem[];
  people?: LookupItem[];
  showFilterBar?: boolean;
}) {
  const [editingItem, setEditingItem] = useState<UnifiedActivity | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");

  // Apply lightweight filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Type Filter
      if (typeFilter === "EXPENSES" && item.type !== "EXPENSE") return false;
      if (typeFilter === "TRANSACTIONS" && item.type === "EXPENSE") return false;

      // Date Filter
      if (dateFilter !== "ALL") {
        const d = new Date(item.date);
        if (dateFilter === "TODAY" && !isToday(d)) return false;
        if (dateFilter === "THIS_WEEK" && !isThisWeek(d, { weekStartsOn: 0 })) return false;
        if (dateFilter === "THIS_MONTH" && !isThisMonth(d)) return false;
      }

      return true;
    });
  }, [data, typeFilter, dateFilter]);

  const groupedData = useMemo(() => groupActivity(filteredData), [filteredData]);
  const hasActiveFilters = typeFilter !== "ALL" || dateFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* Lightweight Filter Bar */}
      {showFilterBar && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-card rounded-2xl border shadow-xs">
          {/* Type Filter Segmented Control */}
          <div className="flex items-center gap-1 p-0.5 bg-muted/80 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter("ALL")}
              className={cn(
                "px-3 py-1.5 font-semibold rounded-lg transition-colors",
                typeFilter === "ALL" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("EXPENSES")}
              className={cn(
                "px-3 py-1.5 font-semibold rounded-lg transition-colors",
                typeFilter === "EXPENSES" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("TRANSACTIONS")}
              className={cn(
                "px-3 py-1.5 font-semibold rounded-lg transition-colors",
                typeFilter === "TRANSACTIONS" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Transactions
            </button>
          </div>

          {/* Date Filter Shortcut Pills */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground ml-1" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="h-8 text-xs font-semibold rounded-xl border bg-card px-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty State handling */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-64 bg-card rounded-2xl border border-dashed shadow-xs gap-3">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Inbox className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">
              {hasActiveFilters ? "No matching activity found" : "Nothing logged yet"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {hasActiveFilters
                ? "Try adjusting your type or date filter to see earlier records."
                : "Log your first expense, income, or transfer to start tracking your daily financial activity."}
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setTypeFilter("ALL");
                setDateFilter("ALL");
              }}
              className="text-xs font-semibold text-primary hover:underline mt-1"
            >
              Clear filters
            </button>
          ) : (
            <div className="mt-2">
              <GlobalAddMenu categories={categories} paymentMethods={paymentMethods} people={people} />
            </div>
          )}
        </div>
      ) : (
        /* Unified Chronological Feed Groups */
        <div className="space-y-6">
          {groupedData.map(([groupName, items]) => (
            <div key={groupName} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 sticky top-14 lg:top-15 bg-background/95 backdrop-blur-md py-2 px-1 z-10 border-b">
                {groupName}
              </h3>
              <div className="bg-card border rounded-2xl shadow-xs divide-y overflow-hidden">
                {items.map((item) => {
                  // Icon & Color Logic for 3 Directions (Inflow, Outflow, Transfer)
                  let IconComp: React.ElementType = ArrowUpRight;
                  let iconClass = "bg-rose-500/10 text-rose-500";

                  if (item.category) {
                    IconComp = (Icons as unknown as Record<string, React.ElementType>)[item.category.icon] || Icons.Circle;
                    iconClass = "";
                  } else if (item.isPositive) {
                    IconComp = ArrowDownLeft;
                    iconClass = "bg-emerald-500/10 text-emerald-500";
                  } else if (item.isNeutral) {
                    IconComp = ArrowRightLeft;
                    iconClass = "bg-indigo-500/10 text-indigo-500";
                  }

                  // Title & Subtitle Labels
                  const categoryOrTypeLabel = item.category?.name || TRANSACTION_TYPE_LABELS[item.type] || item.type.replaceAll("_", " ");
                  const personLabel = item.person?.name ? ` • ${item.person.name}` : "";
                  const formattedDate = format(new Date(item.date), "MMM dd");

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Icon Badge */}
                        <div
                          className={cn("p-2.5 rounded-2xl shrink-0 flex items-center justify-center", iconClass)}
                          style={
                            item.category
                              ? { backgroundColor: `${item.category.color}15`, color: item.category.color }
                              : undefined
                          }
                        >
                          <IconComp className="h-4 w-4 shrink-0" />
                        </div>

                        {/* Title & Category Details */}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            <span>{categoryOrTypeLabel}</span>
                            <span className="text-muted-foreground/70">{personLabel}</span>
                            <span className="mx-1">•</span>
                            <span>{formattedDate}</span>
                          </p>
                        </div>
                      </div>

                      {/* Amount & Actions Dropdown */}
                      <div className="shrink-0 flex items-center ml-3 gap-3">
                        <div className="text-right">
                          <Amount
                            amount={toMinorUnits(item.amount)}
                            sign={item.isPositive ? "positive" : item.isNeutral ? "neutral" : "negative"}
                          />
                          <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wider">
                            {item.paymentMethod?.name || "Cash"}
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-xl h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => setEditingItem(item)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("Duplicate feature coming soon")} className="cursor-pointer">
                              <Copy className="mr-2 h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => {
                                toast.promise(deleteActivity(item.id, item.type), {
                                  loading: "Deleting...",
                                  success: "Deleted successfully",
                                  error: "Failed to delete",
                                });
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Activity Drawer Sheet */}
      <EditActivitySheet
        activity={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
        categories={categories}
        paymentMethods={paymentMethods}
        people={people}
      />
    </div>
  );
}
