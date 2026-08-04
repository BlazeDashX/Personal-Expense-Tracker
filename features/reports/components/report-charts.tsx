// file: features/reports/components/report-charts.tsx
"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatMoney } from "@/lib/finance";
import type { ReportData } from "../queries/get-report-data";

interface ReportChartsProps {
  expenseByCategory: ReportData["expenseByCategory"];
  trendData: ReportData["trendData"];
  cashFlowData: ReportData["cashFlowData"];
}

export function ReportCharts({ expenseByCategory, trendData, cashFlowData }: ReportChartsProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => formatMoney(Number(value || 0) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Expense by Category (Pie Chart) */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Expense by Category</CardTitle>
          <CardDescription>Breakdown of spending across categories.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 w-full pb-4">
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No expenses in this period.</div>
          )}
        </CardContent>
      </Card>

      {/* 2. Cash Flow (Bar Chart) */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Cash Flow</CardTitle>
          <CardDescription>Income vs Outflow vs Expenses.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 w-full pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => formatMoney(Number(val) * 100)} />
              <Tooltip formatter={tooltipFormatter} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {cashFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Spending Trend (Area Chart) */}
      <Card className="col-span-1 lg:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle>Daily Spending Trend</CardTitle>
          <CardDescription>Daily expense amounts over the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 w-full pb-4">
          {trendData.some(d => d.expense > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" minTickGap={30} />
                <YAxis tickFormatter={(val) => formatMoney(Number(val) * 100)} />
                <Tooltip formatter={tooltipFormatter} />
                <Area type="monotone" dataKey="expense" stroke="var(--color-destructive)" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No trend data available.</div>
          )}
        </CardContent>
      </Card>

      {/* 4. Meal Trend (Bar Chart) */}
      <Card className="col-span-1 lg:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle>Meal Tracking</CardTitle>
          <CardDescription>Daily meal count over the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 w-full pb-4">
          {trendData.some(d => d.meals > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" minTickGap={30} />
                <YAxis allowDecimals={false} domain={[0, 2]} />
                <Tooltip />
                <Bar dataKey="meals" fill="var(--color-primary)" radius={[2, 2, 0, 0]} name="Meals Eaten" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No meal records found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}