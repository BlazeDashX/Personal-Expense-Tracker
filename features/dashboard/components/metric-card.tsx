// file: features/dashboard/components/metric-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/finance";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtext?: string;
  isCurrency?: boolean;
  trend?: "up" | "down" | "neutral";
}

export function MetricCard({ title, value, icon: Icon, subtext, isCurrency = true, trend }: MetricCardProps) {
  const formattedValue = isCurrency ? formatMoney(value * 100) : value.toString();
  
  let trendColor = "text-muted-foreground";
  if (trend === "up") trendColor = "text-destructive"; // Spending going up is usually bad
  if (trend === "down") trendColor = "text-emerald-500";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {subtext && (
          <p className={`text-xs mt-1 ${trendColor}`}>
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
}