// file: features/calendar/components/day-details-dialog.tsx
"use client";

import { format } from "date-fns";
import * as Icons from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatMoney } from "@/lib/finance";
import { Badge } from "@/components/ui/badge";
import type { CalendarData } from "../queries/get-calendar-data";

interface DayDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  data: CalendarData | null;
}

export function DayDetailsDialog({ open, onOpenChange, date, data }: DayDetailsDialogProps) {
  if (!date || !data) return null;

  const totalExpense = data.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const cashIn = data.transactions.filter(t => ["CASH_IN", "LOAN_RECEIVED", "BORROWED"].includes(t.type)).reduce((acc, t) => acc + t.amount, 0);
  const cashOut = data.transactions.filter(t => ["CASH_OUT", "LOAN_GIVEN", "RETURNED"].includes(t.type)).reduce((acc, t) => acc + t.amount, 0);
  const mealCount = data.meals[0]?.mealCount || 0;
  const mealNotes = data.meals[0]?.notes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{format(date, "EEEE, MMMM do, yyyy")}</DialogTitle>
          <DialogDescription>Daily summary and recorded activity.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Expenses</span>
            <span className="text-lg font-bold text-destructive">{formatMoney(totalExpense * 100)}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Meals Eaten</span>
            <span className="text-lg font-bold">{mealCount}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Cash In</span>
            <span className="text-lg font-bold text-emerald-500">{formatMoney(cashIn * 100)}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Cash Out</span>
            <span className="text-lg font-bold text-destructive">{formatMoney(cashOut * 100)}</span>
          </div>
        </div>

        {mealNotes && (
          <div className="mb-4 text-sm bg-secondary p-3 rounded-lg">
            <strong>Meal Notes:</strong> {mealNotes}
          </div>
        )}

        <div className="space-y-4">
          {data.expenses.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Expenses</h4>
              <div className="space-y-2">
                {data.expenses.map((exp) => {
                  const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[exp.category?.icon || ""] || Icons.Circle;
                  return (
                    <div key={exp.id} className="flex items-center justify-between text-sm p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <LucideIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{exp.description}</span>
                      </div>
                      <span className="font-medium text-destructive">-{formatMoney(exp.amount * 100)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.transactions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Transactions</h4>
              <div className="space-y-2">
                {data.transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between text-sm p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase">{txn.type.replace("_", " ")}</Badge>
                    </div>
                    <span className="font-medium">{formatMoney(txn.amount * 100)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.expenses.length === 0 && data.transactions.length === 0 && mealCount === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No activity recorded on this date.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}