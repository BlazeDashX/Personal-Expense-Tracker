// file: features/calendar/components/financial-calendar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  addMonths,
  subMonths,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Utensils, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { DayDetailsDialog } from "./day-details-dialog";
import type { CalendarData } from "../queries/get-calendar-data";

interface FinancialCalendarProps {
  currentMonth: Date;
  data: CalendarData;
}

export function FinancialCalendar({ currentMonth, data }: FinancialCalendarProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    router.push(`/calendar?month=${format(next, "yyyy-MM")}`);
  };

  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    router.push(`/calendar?month=${format(prev, "yyyy-MM")}`);
  };

  const goToToday = () => {
    router.push(`/calendar?month=${format(new Date(), "yyyy-MM")}`);
  };

  const getDayData = (day: Date): CalendarData => {
    const dayExpenses = data.expenses.filter(e => isSameDay(new Date(e.expenseDate), day));
    const dayTransactions = data.transactions.filter(t => isSameDay(new Date(t.transactionDate), day));
    const dayMeals = data.meals.filter(m => isSameDay(new Date(m.mealDate), day));

    return { expenses: dayExpenses, transactions: dayTransactions, meals: dayMeals };
  };

  const dailyTotals = days.map(d => {
    const dayExpenses = data.expenses.filter(e => isSameDay(new Date(e.expenseDate), d));
    return dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  });
  const maxExpense = Math.max(...dailyTotals, 1);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{format(currentMonth, dateFormat)}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden border bg-card">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div key={dayName} className="py-3 text-center text-sm font-medium text-muted-foreground">
              {dayName}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayData = getDayData(day);
            const totalExpense = dayData.expenses.reduce((sum, e) => sum + e.amount, 0);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);

            let intensityClass = "bg-transparent";
            if (totalExpense > 0) {
              const ratio = totalExpense / maxExpense;
              if (ratio > 0.66) intensityClass = "bg-destructive/30";
              else if (ratio > 0.33) intensityClass = "bg-destructive/20";
              else intensityClass = "bg-destructive/10";
            }

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-25 border-b border-r p-2 cursor-pointer transition-colors hover:bg-accent/50",
                  !isCurrentMonth && "text-muted-foreground opacity-50 bg-muted/20",
                  intensityClass,
                  (idx + 1) % 7 === 0 && "border-r-0"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn("text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full", isDayToday && "bg-primary text-primary-foreground")}>
                    {format(day, "d")}
                  </span>
                </div>

                <div className="mt-1 flex flex-col gap-1">
                  {totalExpense > 0 && (
                    <div className="text-xs font-semibold text-destructive truncate">
                      -{formatMoney(totalExpense * 100)}
                    </div>
                  )}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {dayData.meals.length > 0 && (
                      <span title={`${dayData.meals[0].mealCount} Meals`} className="flex items-center text-[10px] bg-secondary text-secondary-foreground px-1 py-0.5 rounded">
                        <Utensils className="h-3 w-3 mr-1" /> {dayData.meals[0].mealCount}
                      </span>
                    )}
                    {dayData.transactions.length > 0 && (
                      <span title={`${dayData.transactions.length} Transactions`} className="flex items-center text-[10px] border px-1 py-0.5 rounded">
                        <ArrowRightLeft className="h-3 w-3 mr-1" /> {dayData.transactions.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <DayDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        date={selectedDate}
        data={selectedDate ? getDayData(selectedDate) : null}
      />
    </div>
  );
}