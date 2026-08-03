// file: app/(dashboard)/dashboard/page.tsx
import { getDashboardMetrics, getDashboardLookups } from "@/features/dashboard/queries/get-metrics";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { BudgetProgress } from "@/features/dashboard/components/budget-progress";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { QuickAdd } from "@/features/dashboard/components/quick-add";
import { Wallet, TrendingDown, ArrowDownToLine, Utensils } from "lucide-react";

export default async function DashboardPage() {
  const [metrics, lookups] = await Promise.all([
    getDashboardMetrics(),
    getDashboardLookups(),
  ]);

  const comp = metrics.previousMonthComparison;
  let compText = "No previous data";
  let trend: "up" | "down" | "neutral" = "neutral";
  
  if (comp !== 0) {
    if (comp > 0) {
      trend = "up";
      compText = `+${comp.toFixed(1)}% from last month`;
    } else {
      trend = "down";
      compText = `${comp.toFixed(1)}% from last month`;
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your current financial status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Current Balance" 
          value={metrics.currentBalance} 
          icon={Wallet} 
          subtext="Total available cash" 
        />
        <MetricCard 
          title="Monthly Expense" 
          value={metrics.monthlyExpense} 
          icon={TrendingDown} 
          subtext={compText}
          trend={trend}
        />
        <MetricCard 
          title="Cash In" 
          value={metrics.cashIn} 
          icon={ArrowDownToLine} 
          subtext="Lifetime income & loans" 
        />
        <MetricCard 
          title="Monthly Meals" 
          value={metrics.totalMeals} 
          icon={Utensils} 
          isCurrency={false}
          subtext="Total meals this month" 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BudgetProgress spent={metrics.monthlyExpense} budget={metrics.budgetAmount} />
        <QuickAdd 
          categories={lookups.categories} 
          paymentMethods={lookups.paymentMethods} 
          people={lookups.people} 
        />
      </div>

      <div className="grid gap-4 grid-cols-1">
        <RecentActivity data={metrics.recentActivity} />
      </div>
    </div>
  );
}