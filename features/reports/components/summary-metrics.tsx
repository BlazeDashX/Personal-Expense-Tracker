// file: features/reports/components/summary-metrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/finance";

interface SummaryMetricsProps {
  metrics: {
    totalExpense: number;
    averageDaily: number;
    cashIn: number;
    cashOut: number;
    netFlow: number;
    totalMeals: number;
    highestCategory: string;
    highestSpendingDay: string;
    transactionCount: number;
  };
}

export function SummaryMetrics({ metrics }: SummaryMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">Total Expenses</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0"><div className="text-xl font-bold">{formatMoney(metrics.totalExpense * 100)}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">Avg Daily Spend</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0"><div className="text-xl font-bold">{formatMoney(metrics.averageDaily * 100)}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">Net Cash Flow</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className={`text-xl font-bold ${metrics.netFlow < 0 ? "text-destructive" : "text-emerald-500"}`}>
            {formatMoney(metrics.netFlow * 100)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">Highest Category</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0"><div className="text-xl font-bold truncate">{metrics.highestCategory}</div></CardContent>
      </Card>
    </div>
  );
}