"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Amount } from "@/components/shared/amount";
import { toMinorUnits } from "@/lib/finance";
import { TrendingUp, TrendingDown, Calendar, Tag, Wallet, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryMetricsProps {
  metrics: {
    totalExpense: number;
    averageDaily: number;
    cashIn: number;
    cashOut: number;
    netFlow: number;
    totalMeals: number;
    highestCategory: string;
    highestCategoryAmount?: number;
    highestSpendingDay: string;
    highestSpendingDayAmount?: number;
    transactionCount: number;
    prevTotalExpense?: number;
    expenseComparisonPercent?: number;
  };
}

export function SummaryMetrics({ metrics }: SummaryMetricsProps) {
  const comparison = metrics.expenseComparisonPercent || 0;
  const isComparisonHigher = comparison > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Total Expenses */}
      <Card className="rounded-2xl border bg-card shadow-xs">
        <CardHeader className="p-4 pb-1.5">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Total Expenses</span>
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
          <Amount amount={toMinorUnits(metrics.totalExpense)} sign="negative" className="text-xl sm:text-2xl font-black font-mono tabular-nums" />
          {metrics.prevTotalExpense !== undefined && (
            <div className="flex items-center gap-1 text-[11px] font-semibold">
              {comparison !== 0 ? (
                <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-mono tabular-nums", isComparisonHigher ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500")}>
                  {isComparisonHigher ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isComparisonHigher ? `+${comparison}%` : `${comparison}%`}
                </span>
              ) : (
                <span className="text-muted-foreground">Same as prev</span>
              )}
              <span className="text-muted-foreground font-normal">vs prev</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Avg Daily Spend */}
      <Card className="rounded-2xl border bg-card shadow-xs">
        <CardHeader className="p-4 pb-1.5">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Avg Daily</span>
            <Compass className="h-3.5 w-3.5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
          <Amount amount={toMinorUnits(metrics.averageDaily)} className="text-xl sm:text-2xl font-black font-mono tabular-nums" />
          <p className="text-[11px] text-muted-foreground">Per day average</p>
        </CardContent>
      </Card>

      {/* 3. Net Cash Flow */}
      <Card className="rounded-2xl border bg-card shadow-xs">
        <CardHeader className="p-4 pb-1.5">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Net Cash Flow</span>
            <Wallet className="h-3.5 w-3.5 text-indigo-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
          <Amount
            amount={toMinorUnits(Math.abs(metrics.netFlow))}
            sign={metrics.netFlow > 0 ? "positive" : metrics.netFlow < 0 ? "negative" : "neutral"}
            className="text-xl sm:text-2xl font-black font-mono tabular-nums"
          />
          <p className="text-[11px] text-muted-foreground">Inflow minus outflow</p>
        </CardContent>
      </Card>

      {/* 4. Highest Category */}
      <Card className="rounded-2xl border bg-card shadow-xs">
        <CardHeader className="p-4 pb-1.5">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Top Category</span>
            <Tag className="h-3.5 w-3.5 text-amber-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
          <div className="text-base sm:text-lg font-extrabold text-foreground truncate leading-tight">
            {metrics.highestCategory}
          </div>
          {metrics.highestCategoryAmount ? (
            <Amount amount={toMinorUnits(metrics.highestCategoryAmount)} sign="negative" className="text-xs font-bold font-mono tabular-nums text-muted-foreground" />
          ) : (
            <p className="text-[11px] text-muted-foreground">No data</p>
          )}
        </CardContent>
      </Card>

      {/* 5. Highest Spending Day */}
      <Card className="col-span-2 md:col-span-1 rounded-2xl border bg-card shadow-xs">
        <CardHeader className="p-4 pb-1.5">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Peak Spend Day</span>
            <Calendar className="h-3.5 w-3.5 text-rose-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
          <div className="text-base sm:text-lg font-extrabold text-foreground truncate leading-tight">
            {metrics.highestSpendingDay}
          </div>
          {metrics.highestSpendingDayAmount ? (
            <Amount amount={toMinorUnits(metrics.highestSpendingDayAmount)} sign="negative" className="text-xs font-bold font-mono tabular-nums text-muted-foreground" />
          ) : (
            <p className="text-[11px] text-muted-foreground">No spend</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}