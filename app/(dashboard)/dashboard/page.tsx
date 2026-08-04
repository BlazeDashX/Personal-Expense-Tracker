import { getDashboardMetrics, getDashboardLookups } from "@/features/dashboard/queries/get-metrics";
import { getActivity } from "@/features/activity/queries/get-activity";
import { FinancialHero } from "@/features/dashboard/components/financial-hero";
import { DailyQuickChips } from "@/features/dashboard/components/daily-quick-chips";
import { MealCounterWidget } from "@/features/dashboard/components/meal-counter-widget";
import { QuickWidgetGrid } from "@/features/dashboard/components/quick-widgets";
import { ActivityFeed } from "@/features/activity/components/activity-feed";
import { WeeklyCalendar } from "@/features/calendar/components/weekly-calendar";
import { FloatingQuickDock } from "@/components/layout/floating-quick-dock";

export default async function DashboardPage() {
  const [metrics, lookups, fullActivity] = await Promise.all([
    getDashboardMetrics(),
    getDashboardLookups(),
    getActivity(),
  ]);

  const recentActivity = fullActivity.slice(0, 5);

  // Calculate Today's Expenses
  const todayStr = new Date().toDateString();
  const todayExpense = fullActivity
    .filter(a => a.type === "EXPENSE" && new Date(a.date).toDateString() === todayStr)
    .reduce((sum, a) => sum + a.amount, 0);

  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-16 pt-2 md:pt-4 relative">
      {/* Dynamic Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{greeting}, 👋</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Here is your real-time financial companion for today.</p>
        </div>
      </div>

      {/* Row 1: Glassmorphic Financial Hero with Daily Spending Pace */}
      <FinancialHero 
        currentBalance={metrics.currentBalance}
        monthlyExpense={metrics.monthlyExpense}
        budgetAmount={metrics.budgetAmount}
        cashIn={metrics.cashIn}
        todayExpense={todayExpense}
      />

      {/* Row 2: 1-Tap Daily Quick Expense Chips */}
      <DailyQuickChips 
        categories={lookups.categories} 
        paymentMethods={lookups.paymentMethods} 
      />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Quick Expenses</h2>
            </div>
            <QuickWidgetGrid shortcuts={lookups.shortcuts} type="EXPENSE" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Quick Transactions</h2>
            </div>
            <QuickWidgetGrid shortcuts={lookups.shortcuts} type="TRANSACTION" />
          </div>
          
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Recent Activity</h2>
            </div>
            <ActivityFeed 
              data={recentActivity} 
              categories={lookups.categories}
              paymentMethods={lookups.paymentMethods}
              people={lookups.people}
            />
          </div>
        </div>

        {/* Side Column: Habit Tracking & Calendar */}
        <div className="flex flex-col gap-6">
          <MealCounterWidget 
            initialCount={metrics.todayMeals} 
            target={lookups.userPreferences?.mealTarget || 3} 
          />
          
          <div className="bg-card border rounded-2xl p-5 shadow-sm overflow-hidden">
            <h3 className="font-bold text-base mb-3">This Week</h3>
            <div className="w-full">
               <WeeklyCalendar />
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Floating Quick Dock */}
      <FloatingQuickDock 
        categories={lookups.categories} 
        paymentMethods={lookups.paymentMethods} 
      />
    </div>
  );
}