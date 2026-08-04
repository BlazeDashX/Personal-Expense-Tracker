"use client";

import { useState } from "react";
import { format } from "date-fns";
import * as Icons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Utensils, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { toMinorUnits } from "@/lib/finance";
import { Amount } from "@/components/shared/amount";
import { toast } from "sonner";
import { deleteActivity } from "@/features/activity/actions/activity";
import { EditActivitySheet } from "@/features/forms/components/edit-activity-sheet";
import { TRANSACTION_TYPE_LABELS } from "@/features/activity/components/activity-feed";
import { cn } from "@/lib/utils";
import type { CalendarData } from "../queries/get-calendar-data";
import type { UnifiedActivity } from "@/features/activity/queries/get-activity";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface DayDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  data: CalendarData | null;
  lookups?: {
    categories: LookupItem[];
    paymentMethods: LookupItem[];
    people?: LookupItem[];
  };
}

export function DayDetailsDialog({
  open,
  onOpenChange,
  date,
  data,
  lookups = { categories: [], paymentMethods: [], people: [] },
}: DayDetailsDialogProps) {
  const [editingItem, setEditingItem] = useState<UnifiedActivity | null>(null);

  if (!date || !data) return null;

  const dayExpensesTotal = data.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const mealCount = data.meals.reduce((acc, m) => acc + m.mealCount, 0);

  // Convert expenses and transactions into UnifiedActivity[]
  const unifiedList: UnifiedActivity[] = [
    ...data.expenses.map((e) => ({
      id: e.id,
      type: "EXPENSE" as const,
      date: new Date(e.expenseDate),
      amount: e.amount,
      description: e.description,
      category: e.category || undefined,
      categoryId: e.categoryId || undefined,
      paymentMethod: e.paymentMethod,
      paymentMethodId: e.paymentMethodId,
      isPositive: false,
      isNeutral: false,
    })),
    ...data.transactions.map((t) => {
      const isPositive = ["CASH_IN", "LOAN_RECEIVED", "BORROWED"].includes(t.type);
      const isNeutral = t.type === "TRANSFER";
      return {
        id: t.id,
        type: t.type as UnifiedActivity["type"],
        date: new Date(t.transactionDate),
        amount: t.amount,
        description: t.notes || t.type.replaceAll("_", " "),
        paymentMethod: t.paymentMethod,
        paymentMethodId: t.paymentMethodId,
        person: t.person || undefined,
        personId: t.personId || undefined,
        isPositive,
        isNeutral,
      };
    }),
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {format(date, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Daily summary and recorded activity.
            </DialogDescription>
          </DialogHeader>

          {/* Quick Summary Bar */}
          <div className="grid grid-cols-2 gap-3 py-3">
            <div className="flex flex-col gap-0.5 p-3 bg-muted/50 rounded-2xl border">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Spent</span>
              <Amount amount={toMinorUnits(dayExpensesTotal)} sign="negative" className="text-lg font-bold font-mono tabular-nums" />
            </div>
            <div className="flex flex-col gap-0.5 p-3 bg-muted/50 rounded-2xl border">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Meals Eaten</span>
              <div className="text-lg font-bold font-mono tabular-nums flex items-center gap-1.5 text-foreground">
                <Utensils className="h-4 w-4 text-primary" /> {mealCount} meals
              </div>
            </div>
          </div>

          {/* Activity Feed Rows */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
              Activity ({unifiedList.length})
            </h4>

            {unifiedList.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 border border-dashed rounded-2xl text-xs">
                No financial activity logged for this date.
              </div>
            ) : (
              <div className="bg-card border rounded-2xl divide-y overflow-hidden">
                {unifiedList.map((item) => {
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

                  const typeLabel = item.category?.name || TRANSACTION_TYPE_LABELS[item.type] || item.type.replaceAll("_", " ");

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn("p-2 rounded-xl shrink-0 flex items-center justify-center", iconClass)}
                          style={
                            item.category
                              ? { backgroundColor: `${item.category.color}15`, color: item.category.color }
                              : undefined
                          }
                        >
                          <IconComp className="h-4 w-4 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{item.description}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{typeLabel}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Amount
                          amount={toMinorUnits(item.amount)}
                          sign={item.isPositive ? "positive" : item.isNeutral ? "neutral" : "negative"}
                          className="text-xs font-mono tabular-nums font-bold"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg h-7 w-7 text-muted-foreground hover:bg-muted">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => setEditingItem(item)} className="cursor-pointer">
                              <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => {
                                toast.promise(deleteActivity(item.id, item.type), {
                                  loading: "Deleting...",
                                  success: "Deleted",
                                  error: "Failed to delete",
                                });
                              }}
                            >
                              <Trash className="mr-2 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EditActivitySheet
        activity={editingItem}
        open={!!editingItem}
        onOpenChange={(o) => { if (!o) setEditingItem(null); }}
        categories={lookups.categories}
        paymentMethods={lookups.paymentMethods}
        people={lookups.people}
      />
    </>
  );
}