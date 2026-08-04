"use client";

import { ArrowDownToLine, TrendingDown, Target, Sparkles, Sun, Moon, Sunrise, Compass } from "lucide-react";

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
  const budgetPercent = budgetAmount > 0 ? (monthlyExpense / budgetAmount) * 100 : 0;
  
  // Calculate Daily Budget Allowance
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  
  // Safe daily allowance = remaining budget divided by remaining days in month
  const safeDailyAllowance = budgetAmount > 0 
    ? Math.max(0, Math.round(budgetRemaining / daysRemaining)) 
    : 0;

  const isDailyOver = safeDailyAllowance > 0 && todayExpense > safeDailyAllowance;
  const dailyPercent = safeDailyAllowance > 0 ? Math.min(100, (todayExpense / safeDailyAllowance) * 100) : 0;

  let budgetColor = "text-emerald-500";
  let budgetBg = "bg-emerald-500";
  if (budgetPercent > 90) {
    budgetColor = "text-rose-500";
    budgetBg = "bg-rose-500";
  } else if (budgetPercent > 75) {
    budgetColor = "text-amber-500";
    budgetBg = "bg-amber-500";
  }

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
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {safeDailyAllowance > 0 
                ? `Safe Today: ৳${safeDailyAllowance.toLocaleString()}/day` 
                : "Budget Active"}
            </span>
          </div>
        )}
      </div>

      {/* Available Balance Big Display */}
      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Available Balance</span>
        <div className="text-4xl md:text-5xl font-black tracking-tight flex items-baseline gap-2">
          <span>৳{currentBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Key Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 pt-2 border-t border-border/50">
        <HeroStat 
          icon={<TrendingDown className="h-4 w-4 text-rose-500" />} 
          label="Spent this month" 
          value={`৳${monthlyExpense.toLocaleString()}`} 
        />
        <HeroStat 
          icon={<ArrowDownToLine className="h-4 w-4 text-emerald-500" />} 
          label="Cash in" 
          value={`৳${cashIn.toLocaleString()}`} 
        />
        
        {/* Daily Spending Pace Card */}
        {safeDailyAllowance > 0 ? (
          <div className="col-span-2 flex flex-col justify-center gap-2 p-3.5 bg-background/80 backdrop-blur-md rounded-2xl border border-border/80 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Compass className="h-3.5 w-3.5 text-primary" /> Daily Pace
              </span>
              <span className={`font-bold ${isDailyOver ? "text-rose-500" : "text-emerald-500"}`}>
                ৳{todayExpense} / ৳{safeDailyAllowance}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${isDailyOver ? "bg-rose-500" : "bg-emerald-500"} transition-all duration-500`} 
                style={{ width: `${dailyPercent}%` }} 
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {isDailyOver 
                ? "⚠️ Exceeded safe daily limit" 
                : `🟢 ৳${safeDailyAllowance - todayExpense} room left for today`}
            </span>
          </div>
        ) : (
          budgetAmount > 0 && (
            <div className="col-span-2 flex flex-col justify-center gap-2 p-3.5 bg-background/80 backdrop-blur-md rounded-2xl border border-border/80 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" /> Budget Remaining
                </span>
                <span className={`font-bold ${budgetColor}`}>
                  ৳{Math.max(0, budgetRemaining).toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${budgetBg} transition-all duration-500`} 
                  style={{ width: `${Math.min(100, budgetPercent)}%` }} 
                />
              </div>
            </div>
          )
        )}
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
      <div className="font-bold text-foreground text-lg md:text-xl">
        {value}
      </div>
    </div>
  );
}
