// file: features/dashboard/components/budget-progress.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/finance";

interface BudgetProgressProps {
  spent: number;
  budget: number;
}

export function BudgetProgress({ spent, budget }: BudgetProgressProps) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const safePercentage = Math.min(percentage, 100);
  
  let colorClass = "bg-primary";
  if (percentage >= 90) colorClass = "bg-destructive";
  else if (percentage >= 70) colorClass = "bg-orange-500";

  const remaining = budget - spent;

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle>Monthly Budget</CardTitle>
        <CardDescription>
          {budget > 0 
            ? `${formatMoney(spent * 100)} of ${formatMoney(budget * 100)} spent` 
            : "No budget set for this month"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={safePercentage} className="h-3 mb-2" indicatorClassName={colorClass} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(1)}% Used</span>
          <span className={remaining < 0 ? "text-destructive font-medium" : ""}>
            {remaining < 0 ? `Over budget by ${formatMoney(Math.abs(remaining) * 100)}` : `${formatMoney(remaining * 100)} remaining`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}