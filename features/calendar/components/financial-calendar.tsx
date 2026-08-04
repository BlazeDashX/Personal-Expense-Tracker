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
  getDaysInMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Utensils, Compass, TrendingDown, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Amount } from "@/components/shared/amount";
import { formatMoney, toMinorUnits } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { DayDetailsDialog } from "./day-details-dialog";
import type { CalendarData } from "../queries/get-calendar-data";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface FinancialCalendarProps {
  currentMonth: Date;
  data: CalendarData;
  budgetAmount?: number;
  lookups?: {
    categories: LookupItem[];
    paymentMethods: LookupItem[];
    people?: LookupItem[];
  };
}

export function FinancialCalendar({
  currentMonth,
  data,
  budgetAmount = 0,
  lookups = { categories: [], paymentMethods: [], people: [] },
}: FinancialCalendarProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Navigation handlers
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

  // Helper to extract day specific data
  const getDayData = (day: Date): CalendarData => {
    const dayExpenses = data.expenses.filter((e) => isSameDay(new Date(e.expenseDate), day));
    const dayTransactions = data.transactions.filter((t) => isSameDay(new Date(t.transactionDate), day));
    const dayMeals = data.meals.filter((m) => isSameDay(new Date(m.mealDate), day));

    return { expenses: dayExpenses, transactions: dayTransactions, meals: dayMeals };
  };

  // Monthly totals & max day expense calculation
  const totalMonthExpenses = data.expenses
    .filter((e) => isSameMonth(new Date(e.expenseDate), monthStart))
    .reduce((sum, e) => sum + e.amount, 0);

  const dailyTotals = days.map((d) => {
    const dayExpenses = data.expenses.filter((e) => isSameDay(new Date(e.expenseDate), d));
    return dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  });
  const maxExpense = Math.max(...dailyTotals, 1);

  // Safe daily pace calculation
  const now = new Date();
  const daysInMonth = getDaysInMonth(currentMonth);
  const currentDay = isSameMonth(now, currentMonth) ? now.getDate() : 1;
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  const budgetRemaining = budgetAmount - totalMonthExpenses;
  const safeDailyAllowance = budgetAmount > 0 ? Math.max(0, Math.round(budgetRemaining / daysRemaining)) : 0;

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Month Summary Strip Above Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Month Expenses */}
        <div className="flex flex-col gap-1 p-4 rounded-2xl border bg-card shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" /> Total Month Spent
          </span>
          <div className="text-2xl font-black font-mono tabular-nums text-foreground">
            <Amount amount={toMinorUnits(totalMonthExpenses)} sign="negative" />
          </div>
          <span className="text-[11px] text-muted-foreground">{format(currentMonth, "MMMM yyyy")}</span>
        </div>

        {/* Budget Daily Pace */}
        <div className="flex flex-col gap-1 p-4 rounded-2xl border bg-card shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-primary" /> Daily Safe Allowance
          </span>
          <div className="text-2xl font-black font-mono tabular-nums text-foreground">
            {budgetAmount > 0 ? formatMoney(toMinorUnits(safeDailyAllowance)) : "No budget set"}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
            {budgetAmount > 0 ? `${daysRemaining} days remaining in month` : "Set budget in Settings"}
          </span>
        </div>

        {/* Overall Month Status */}
        <div className="flex flex-col gap-1 p-4 rounded-2xl border bg-card shadow-xs justify-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month Budget</span>
          <div className="text-xl font-bold font-mono tabular-nums text-foreground">
            {budgetAmount > 0 ? formatMoney(toMinorUnits(budgetAmount)) : "Unbudgeted"}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {budgetAmount > 0
              ? budgetRemaining >= 0
                ? `${formatMoney(toMinorUnits(budgetRemaining))} remaining`
                : `Over by ${formatMoney(toMinorUnits(Math.abs(budgetRemaining)))}`
              : "Set a monthly target"}
          </span>
        </div>
      </div>

      {/* 2. Month Selector Navigation */}
      <div className="flex items-center justify-between p-4 rounded-2xl border bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black tracking-tight text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs font-semibold rounded-xl">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 3. Heatmap Calendar Grid (Responsive without horizontal scroll) */}
      <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground py-2.5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div key={dayName}>{dayName}</div>
          ))}
        </div>

        {/* 7-Column Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
          {days.map((day) => {
            const dayData = getDayData(day);
            const totalExpense = dayData.expenses.reduce((sum, e) => sum + e.amount, 0);
            const totalMeals = dayData.meals.reduce((sum, m) => sum + m.mealCount, 0);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);

            // Heatmap lightness intensity (Rose token)
            let intensityClass = "bg-card";
            if (!isCurrentMonth) {
              intensityClass = "bg-muted/10 opacity-30 text-muted-foreground";
            } else if (totalExpense > 0) {
              const ratio = totalExpense / maxExpense;
              if (ratio > 0.6) intensityClass = "bg-rose-500/30 font-semibold";
              else if (ratio > 0.3) intensityClass = "bg-rose-500/20";
              else intensityClass = "bg-rose-500/10";
            }

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-16 sm:min-h-24 p-1.5 sm:p-2 cursor-pointer transition-all hover:ring-2 hover:ring-primary/40 flex flex-col justify-between relative group",
                  intensityClass,
                  isDayToday && "ring-2 ring-primary ring-offset-1 z-10"
                )}
              >
                {/* Cell Day Header */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "text-xs font-bold leading-none h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full",
                      isDayToday ? "bg-primary text-primary-foreground font-black shadow-xs" : "text-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Spend & Habit Indicators */}
                <div className="mt-1 flex flex-col gap-0.5 min-w-0">
                  {/* Spend Figure Label for Precision */}
                  {totalExpense > 0 ? (
                    <span className="text-[10px] sm:text-xs font-extrabold font-mono tabular-nums text-rose-500 truncate leading-none">
                      -{formatMoney(toMinorUnits(totalExpense))}
                    </span>
                  ) : isCurrentMonth ? (
                    <span className="text-[10px] text-muted-foreground/50 leading-none">—</span>
                  ) : null}

                  {/* Meal Habit Indicator */}
                  {totalMeals > 0 && (
                    <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <Utensils className="h-2.5 w-2.5 shrink-0" />
                      <span>{totalMeals}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Day Activity Details Popup Dialog */}
      <DayDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        date={selectedDate}
        data={selectedDate ? getDayData(selectedDate) : null}
        lookups={lookups}
      />
    </div>
  );
}