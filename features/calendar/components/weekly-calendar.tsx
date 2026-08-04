"use client";

import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { formatMoney, toMinorUnits } from "@/lib/finance";
import { cn } from "@/lib/utils";

interface WeeklyCalendarProps {
  expenses?: Array<{ expenseDate: Date | string; amount: number }>;
  meals?: Array<{ mealDate: Date | string; mealCount: number }>;
}

export function WeeklyCalendar({ expenses = [], meals = [] }: WeeklyCalendarProps) {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full">
      {days.map((date) => {
        const isToday = isSameDay(date, today);

        // Sum expenses for this day
        const dayExpense = expenses
          .filter((e) => isSameDay(new Date(e.expenseDate), date))
          .reduce((sum, e) => sum + e.amount, 0);

        // Sum meals for this day
        const dayMeals = meals
          .filter((m) => isSameDay(new Date(m.mealDate), date))
          .reduce((sum, m) => sum + m.mealCount, 0);

        return (
          <div
            key={date.toISOString()}
            className={cn(
              "flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-2xl border transition-all text-center min-w-0",
              isToday
                ? "bg-primary border-primary text-primary-foreground shadow-md font-bold"
                : "bg-card border-border/70 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {/* EEE label (Sun, Mon, Tue...) */}
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
              {format(date, "EEE")}
            </span>
            
            {/* Day Number (1, 2, 3...) */}
            <span className={cn("text-base font-extrabold my-0.5", isToday ? "text-primary-foreground" : "text-foreground")}>
              {format(date, "d")}
            </span>

            {/* Daily Amount */}
            <span
              className={cn(
                "text-[10px] font-bold font-mono tabular-nums leading-none truncate w-full",
                isToday ? "text-primary-foreground/90" : "text-foreground/90"
              )}
            >
              {dayExpense > 0 ? formatMoney(toMinorUnits(dayExpense)) : "—"}
            </span>

            {/* Meal Dots Indicator */}
            <div className="flex gap-0.5 mt-1.5">
              {Array.from({ length: 3 }).map((_, m) => (
                <div
                  key={m}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    m < dayMeals
                      ? isToday
                        ? "bg-primary-foreground"
                        : "bg-primary"
                      : isToday
                      ? "bg-primary-foreground/20"
                      : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
