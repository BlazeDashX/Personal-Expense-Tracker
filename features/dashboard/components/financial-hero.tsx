"use client";

import Link from "next/link";
import { ArrowDownToLine, TrendingDown, Sparkles, Sun, Moon, Sunrise, Compass, ArrowRight } from "lucide-react";
import { formatMoney, toMinorUnits } from "@/lib/finance";
import { Amount } from "@/components/shared/amount";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FinancialHeroProps {
  currentBalance: number;
  monthlyExpense: number;
  budgetAmount: number;
  cashIn: number;
  todayExpense?: number;
}

export function FinancialHero({ 
  currentBalance, 
  monthlyExpense, 
  budgetAmount, 
  cashIn,
  todayExpense = 0,
}: FinancialHeroProps) {
  const budgetRemaining = budgetAmount - monthlyExpense;
  
  // Calculate Daily Budget Allowance
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  
  // Safe daily allowance = remaining budget divided by remaining days in month
  const safeDailyAllowance = budgetAmount > 0 
    ? Math.max(0, Math.round(budgetRemaining / daysRemaining)) 
    : 0;

  // Greeting & Time Badge
  const hour = now.getHours();
  let TimeIcon = Sunrise;
  let timeLabel = "Morning digest";
  if (hour >= 12 && hour < 17) {
    TimeIcon = Sun;
    timeLabel = "Afternoon digest";
  } else if (hour >= 17) {
    TimeIcon = Moon;
    timeLabel = "Evening digest";
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 bg-linear-to-br from-card via-card to-primary/5 rounded-3xl border shadow-md relative overflow-hidden backdrop-blur-xl">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* Header Row with Time Digest Badge */}
      <div className="flex items-center justify-between relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
          <TimeIcon className="h-3.5 w-3.5" />
          <span>{timeLabel}</span>
        </div>

        {budgetAmount > 0 && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full font-mono tabular-nums">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>
              Safe Today: {formatMoney(toMinorUnits(safeDailyAllowance))}/day
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Available Balance + Signature Daily Pace Ring */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Available Balance Display */}
        <div className="md:col-span-6 flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Available Balance</span>
          <div className="text-4xl md:text-5xl font-black tracking-tight flex items-baseline gap-2">
            <Amount amount={toMinorUnits(currentBalance)} className="text-4xl md:text-5xl font-black tracking-tight" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Real-time liquid balance across all accounts</p>
        </div>

        {/* Signature Daily Pace Focal Point */}
        <div className="md:col-span-6">
          <DailyPaceRing 
            todayExpense={todayExpense} 
            safeAllowance={safeDailyAllowance} 
            budgetAmount={budgetAmount} 
          />
        </div>
      </div>

      {/* Key Stats Footer Row */}
      <div className="grid grid-cols-2 gap-4 relative z-10 pt-4 border-t border-border/50">
        <HeroStat 
          icon={<TrendingDown className="h-4 w-4 text-rose-500" />} 
          label="Spent this month" 
          value={formatMoney(toMinorUnits(monthlyExpense))} 
        />
        <HeroStat 
          icon={<ArrowDownToLine className="h-4 w-4 text-emerald-500" />} 
          label="Cash in this month" 
          value={formatMoney(toMinorUnits(cashIn))} 
        />
      </div>
    </div>
  );
}

function DailyPaceRing({ 
  todayExpense, 
  safeAllowance, 
  budgetAmount 
}: { 
  todayExpense: number; 
  safeAllowance: number; 
  budgetAmount: number;
}) {
  if (budgetAmount <= 0) {
    return (
      <div className="flex flex-col items-start gap-2.5 p-4 rounded-2xl bg-card/60 border border-primary/20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-primary">
          <Compass className="h-4 w-4" />
          <span className="font-bold text-xs uppercase tracking-wider">Daily Pace Feature</span>
        </div>
        <div className="space-y-0.5">
          <h4 className="font-bold text-sm text-foreground">Track Your Daily Pace</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Set a monthly budget to get a real-time safe daily spending allowance that adapts automatically every day.
          </p>
        </div>
        <Link href="/budgets">
          <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
            Set Monthly Budget <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  const percentage = safeAllowance > 0 ? Math.min(100, Math.round((todayExpense / safeAllowance) * 100)) : 0;
  const isOver = safeAllowance > 0 && todayExpense > safeAllowance;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-md shadow-sm">
      {/* SVG Progress Ring */}
      <div className="relative flex items-center justify-center shrink-0 w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-muted"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={cn(
              "transition-all duration-700 ease-out",
              isOver ? "stroke-destructive" : "stroke-primary"
            )}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold font-mono tabular-nums">
            {percentage}%
          </span>
          <span className="text-[9px] uppercase tracking-tighter text-muted-foreground font-semibold">Pace</span>
        </div>
      </div>

      {/* Ring Metadata */}
      <div className="flex flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span>Daily Spending Pace</span>
        </div>
        <div className="text-base font-extrabold font-mono tabular-nums text-foreground">
          {formatMoney(toMinorUnits(todayExpense))} <span className="text-xs font-normal text-muted-foreground">/ {formatMoney(toMinorUnits(safeAllowance))}</span>
        </div>
        <span className={cn("text-xs font-medium font-mono tabular-nums", isOver ? "text-destructive" : "text-emerald-500 font-semibold")}>
          {isOver
            ? `⚠️ Over safe limit by ${formatMoney(toMinorUnits(todayExpense - safeAllowance))}`
            : `🟢 ${formatMoney(toMinorUnits(safeAllowance - todayExpense))} safe to spend today`}
        </span>
      </div>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon} {label}
      </div>
      <div className="font-bold text-foreground text-lg md:text-xl font-mono tabular-nums">
        {value}
      </div>
    </div>
  );
}
