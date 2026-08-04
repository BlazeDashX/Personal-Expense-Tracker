"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatMoney, toMinorUnits } from "@/lib/finance";
import { Amount } from "@/components/shared/amount";
import type { ReportData } from "../queries/get-report-data";

interface ReportChartsProps {
  expenseByCategory: ReportData["expenseByCategory"];
  trendData: ReportData["trendData"];
  cashFlowData: ReportData["cashFlowData"];
}

export function ReportCharts({ expenseByCategory, trendData, cashFlowData }: ReportChartsProps) {
  const totalExpenseSum = expenseByCategory.reduce((sum, item) => sum + item.value, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => formatMoney(toMinorUnits(Number(value || 0)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Category Breakdown (Pie Chart + Ranked Table Side-by-Side / Stacked) */}
      <Card className="col-span-1 lg:col-span-2 flex flex-col rounded-2xl border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Expense Breakdown by Category</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Ranked category share and expenditure analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
          {/* Pie Donut Chart */}
          <div className="lg:col-span-5 h-[320px] w-full flex items-center justify-center">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip formatter={tooltipFormatter} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No expense data recorded.
              </div>
            )}
          </div>

          {/* Ranked Category Data Table (Colorblind-Safe with Text + % + ৳) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Category Rankings & Share
            </div>
            {expenseByCategory.length > 0 ? (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {expenseByCategory.map((cat, idx) => {
                  const sharePercent = totalExpenseSum > 0 ? Math.round((cat.value / totalExpenseSum) * 100) : 0;
                  return (
                    <div key={cat.name} className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/30 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-bold font-mono text-muted-foreground w-4 text-center">#{idx + 1}</span>
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-bold text-foreground truncate">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xs font-semibold font-mono tabular-nums px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {sharePercent}%
                        </span>
                        <Amount amount={toMinorUnits(cat.value)} sign="negative" className="text-xs font-mono tabular-nums font-bold" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No categories logged.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Cash Flow (Bar Chart) */}
      <Card className="flex flex-col rounded-2xl border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Cash Flow Overview</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Income vs Outflow vs Expenses.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] w-full pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(val) => formatMoney(toMinorUnits(Number(val)))} tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <Tooltip formatter={tooltipFormatter} cursor={{ fill: "transparent" }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {cashFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Daily Spending Trend (Area Chart) */}
      <Card className="flex flex-col rounded-2xl border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Daily Spending Trend</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Daily expense amounts over the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] w-full pb-4">
          {trendData.some((d) => d.expense > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="date" minTickGap={25} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(val) => formatMoney(toMinorUnits(Number(val)))} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip formatter={tooltipFormatter} />
                <Area type="monotone" dataKey="expense" stroke="var(--color-destructive)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No trend data available.</div>
          )}
        </CardContent>
      </Card>

      {/* 4. Meal Habit Trend (Bar Chart) */}
      <Card className="col-span-1 lg:col-span-2 flex flex-col rounded-2xl border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Meal Logging Consistency</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Daily meal count logged over the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] w-full pb-4">
          {trendData.some((d) => d.meals > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="date" minTickGap={25} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} domain={[0, 4]} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip />
                <Bar dataKey="meals" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Meals Eaten" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No meal records found in this range.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}