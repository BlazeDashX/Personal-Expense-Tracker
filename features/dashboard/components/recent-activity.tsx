import { format } from "date-fns";
import * as Icons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatMoney } from "@/lib/finance";
import type { Category } from "@/features/settings/components/settings-panels";
import type React from "react";

interface RecentExpense {
  id: string;
  amount: number;
  description: string;
  expenseDate: string | Date;
  category: Category;
}

export function RecentActivity({ data }: { data: RecentExpense[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-full md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest recorded expenses.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <Icons.Inbox className="h-10 w-10 mb-2 opacity-20" />
          <p>No recent activity found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest recorded expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((item) => {
            const Icon = (Icons as unknown as Record<string, React.ElementType>)[item.category.icon] || Icons.Circle;
            return (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full" style={{ backgroundColor: item.category.color + "20", color: item.category.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.category.name} • {format(new Date(item.expenseDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="font-medium text-destructive">
                  -{formatMoney(item.amount * 100)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}