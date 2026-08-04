"use client";

import { useState, useTransition } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  subMonths,
  addMonths,
  subDays,
  isToday,
  getDaysInMonth,
} from "date-fns";
import {
  Flame,
  CheckCircle2,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Calendar as CalendarIcon,
  ListFilter,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { incrementMealCount, decrementMealCount } from "@/features/dashboard/actions/meals";
import { saveMeal } from "../actions/meal-actions";
import { DataTable } from "./data-table";
import { columns, type MealColumnType } from "./columns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MealTrackerProps {
  meals: MealColumnType[];
  target: number;
}

export function MealTracker({ meals, target }: MealTrackerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "table">("calendar");
  const [isPending, startTransition] = useTransition();

  // Map of date string YYYY-MM-DD -> mealCount
  const mealMap = useMemoMap(meals);

  // Today's count & date string
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayCount = mealMap.get(todayStr) || 0;

  // Streak & Monthly Stats
  const { streak, daysHitThisMonth, totalMealsThisMonth } = useMemoStats(meals, target, currentMonth, mealMap);

  // Quick Today Stepper Action
  const handleTodayIncrement = () => {
    startTransition(async () => {
      try {
        await incrementMealCount(todayStr);
        toast.success(`Logged meal! Today: ${todayCount + 1}/${target}`);
      } catch {
        toast.error("Failed to update meal count");
      }
    });
  };

  const handleTodayDecrement = () => {
    if (todayCount <= 0) return;
    startTransition(async () => {
      try {
        await decrementMealCount(todayStr);
        toast.info(`Updated meal count. Today: ${todayCount - 1}/${target}`);
      } catch {
        toast.error("Failed to update meal count");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & View Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Meal Tracker & Habit</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track daily meals against your target ({target} meals/day) and build your streak.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-2xl border shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all",
              activeTab === "calendar"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 text-primary" /> Habit Calendar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all",
              activeTab === "table"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListFilter className="h-3.5 w-3.5" /> Ledger List
          </button>
        </div>
      </div>

      {/* 2. Top Habit Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Badge */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl border bg-card shadow-xs">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Current Streak</span>
            <div className="text-2xl font-black font-mono tabular-nums text-foreground">
              {streak} <span className="text-xs font-normal text-muted-foreground">days</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Hitting ≥{target} meals/day</span>
          </div>
        </div>

        {/* Days Hit This Month */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl border bg-card shadow-xs">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Target Hit</span>
            <div className="text-2xl font-black font-mono tabular-nums text-foreground">
              {daysHitThisMonth} <span className="text-xs font-normal text-muted-foreground">/ {getDaysInMonth(currentMonth)} days</span>
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold font-mono tabular-nums">
              {Math.round((daysHitThisMonth / getDaysInMonth(currentMonth)) * 100)}% monthly consistency
            </span>
          </div>
        </div>

        {/* Total Meals Logged */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl border bg-card shadow-xs">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total Meals</span>
            <div className="text-2xl font-black font-mono tabular-nums text-foreground">
              {totalMealsThisMonth} <span className="text-xs font-normal text-muted-foreground">meals</span>
            </div>
            <span className="text-[11px] text-muted-foreground">In {format(currentMonth, "MMMM yyyy")}</span>
          </div>
        </div>

        {/* Today's Stepper Widget */}
        <div className="flex flex-col justify-between p-4 rounded-2xl border bg-linear-to-br from-card to-primary/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Today&apos;s Meals
            </span>
            <span className="text-xs font-bold font-mono tabular-nums text-primary px-2 py-0.5 rounded-full bg-primary/10">
              {todayCount} / {target}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleTodayDecrement}
              disabled={isPending || todayCount <= 0}
              className="h-9 w-9 rounded-xl shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center font-black text-xl font-mono tabular-nums">
              {todayCount}
            </div>
            <Button
              size="icon"
              onClick={handleTodayIncrement}
              disabled={isPending}
              className="h-9 w-9 rounded-xl shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Primary Habit Calendar View */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl border bg-card shadow-xs">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-foreground">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="h-8 w-8 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
                className="h-8 text-xs font-semibold rounded-xl"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="h-8 w-8 rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <CalendarGrid
            month={currentMonth}
            mealMap={mealMap}
            target={target}
          />
        </div>
      )}

      {/* 4. Secondary Table View */}
      {activeTab === "table" && (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={meals}
          />
        </div>
      )}
    </div>
  );
}

/* Calendar Grid Component with Quick-Editing Stepper Popovers */
function CalendarGrid({
  month,
  mealMap,
  target,
}: {
  month: Date;
  mealMap: Map<string, number>;
  target: number;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-2xl border bg-card p-3 sm:p-5 shadow-xs space-y-3">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b">
        {weekHeaders.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((d) => {
          const dateKey = format(d, "yyyy-MM-dd");
          const count = mealMap.get(dateKey) || 0;
          const isCurrentMonth = isSameMonth(d, month);
          const isCurrentDay = isToday(d);
          const isTargetHit = count >= target;
          const isPartial = count > 0 && count < target;

          return (
            <DayCell
              key={dateKey}
              date={d}
              dateKey={dateKey}
              count={count}
              target={target}
              isCurrentMonth={isCurrentMonth}
              isCurrentDay={isCurrentDay}
              isTargetHit={isTargetHit}
              isPartial={isPartial}
            />
          );
        })}
      </div>
    </div>
  );
}

/* Individual Interactive Day Cell with Stepper Popover */
function DayCell({
  date,
  dateKey,
  count,
  target,
  isCurrentMonth,
  isCurrentDay,
  isTargetHit,
  isPartial,
}: {
  date: Date;
  dateKey: string;
  count: number;
  target: number;
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  isTargetHit: boolean;
  isPartial: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSetCount = (newCount: number) => {
    if (newCount < 0) return;
    startTransition(async () => {
      try {
        await saveMeal({
          mealDate: new Date(dateKey),
          mealCount: newCount,
        });
        toast.success(`Set ${format(date, "MMM d")} meals to ${newCount}`);
        setIsOpen(false);
      } catch {
        toast.error("Failed to update meal count");
      }
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={cn(
          "flex flex-col items-center justify-between p-1.5 sm:p-2.5 rounded-xl border transition-all text-center min-h-16 sm:min-h-18 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !isCurrentMonth && "opacity-30 border-transparent bg-transparent",
          isCurrentMonth && !isTargetHit && !isPartial && "bg-muted/30 border-muted/70 hover:bg-muted/60",
          isCurrentMonth && isPartial && "bg-emerald-500/15 border-emerald-500/30 text-foreground hover:bg-emerald-500/25",
          isCurrentMonth && isTargetHit && "bg-emerald-500 text-white border-emerald-600 shadow-xs hover:bg-emerald-600 font-bold",
          isCurrentDay && "ring-2 ring-primary ring-offset-1"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <span className={cn("text-xs font-bold", isTargetHit ? "text-white" : "text-foreground")}>
            {format(date, "d")}
          </span>
          {isTargetHit && <Flame className="h-3 w-3 text-amber-300 fill-amber-300" />}
        </div>

        <div className="my-auto">
          <span
            className={cn(
              "text-[11px] font-extrabold font-mono tabular-nums px-1.5 py-0.5 rounded-md",
              isTargetHit ? "bg-white/20 text-white" : isPartial ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )}
          >
            {count}/{target}
          </span>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-3 rounded-2xl border bg-popover shadow-lg" sideOffset={6}>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-foreground">
              {format(date, "EEEE, MMM d")}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">Target: {target}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSetCount(count - 1)}
              disabled={isPending || count <= 0}
              className="h-9 w-9 rounded-xl shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className="text-xl font-black font-mono tabular-nums text-foreground">
              {count}
            </span>

            <Button
              size="icon"
              onClick={() => handleSetCount(count + 1)}
              disabled={isPending}
              className="h-9 w-9 rounded-xl shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helpers for memoization & statistics calculation
function useMemoMap(meals: MealColumnType[]) {
  const map = new Map<string, number>();
  meals.forEach((m) => {
    const key = format(new Date(m.mealDate), "yyyy-MM-dd");
    map.set(key, (map.get(key) || 0) + m.mealCount);
  });
  return map;
}

function useMemoStats(meals: MealColumnType[], target: number, currentMonth: Date, mealMap: Map<string, number>) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Calculate Streak
  let streak = 0;
  let checkDate = new Date();
  const todayKey = format(checkDate, "yyyy-MM-dd");
  const todayCount = mealMap.get(todayKey) || 0;

  if (todayCount < target) {
    const yesterday = subDays(checkDate, 1);
    const yesterdayKey = format(yesterday, "yyyy-MM-dd");
    if ((mealMap.get(yesterdayKey) || 0) >= target) {
      checkDate = yesterday;
    }
  }

  while (true) {
    const key = format(checkDate, "yyyy-MM-dd");
    const count = mealMap.get(key) || 0;
    if (count >= target) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Monthly stats
  let daysHitThisMonth = 0;
  let totalMealsThisMonth = 0;

  meals.forEach((m) => {
    const d = new Date(m.mealDate);
    if (d >= monthStart && d <= monthEnd) {
      totalMealsThisMonth += m.mealCount;
      if (m.mealCount >= target) {
        daysHitThisMonth++;
      }
    }
  });

  return {
    streak,
    daysHitThisMonth,
    totalMealsThisMonth,
  };
}
