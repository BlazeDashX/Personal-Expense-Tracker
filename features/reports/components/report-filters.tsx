"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
} from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { downloadDataAsFile } from "@/features/expenses/utils/export";
import { toast } from "sonner";
import type { ReportData } from "../queries/get-report-data";
import type { ExpenseColumnType } from "@/features/expenses/components/columns";

interface ReportFiltersProps {
  rawExpenses?: ReportData["rawExpenses"];
}

export function ReportFilters({ rawExpenses = [] }: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPreset = searchParams.get("preset") ?? "current_month";
  const currentStart = searchParams.get("start") ?? "";
  const currentEnd = searchParams.get("end") ?? "";

  const [preset, setPreset] = useState(currentPreset);
  const [customStart, setCustomStart] = useState(currentStart);
  const [customEnd, setCustomEnd] = useState(currentEnd);

  const applyFilter = (p: string, start?: string, end?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", p);

    let s = start;
    let e = end;
    const now = new Date();

    if (p === "current_week") {
      s = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
      e = format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
    } else if (p === "current_month") {
      s = format(startOfMonth(now), "yyyy-MM-dd");
      e = format(endOfMonth(now), "yyyy-MM-dd");
    } else if (p === "prev_month") {
      const prev = subMonths(now, 1);
      s = format(startOfMonth(prev), "yyyy-MM-dd");
      e = format(endOfMonth(prev), "yyyy-MM-dd");
    } else if (p === "last_3_months") {
      const prev3 = subMonths(now, 3);
      s = format(startOfMonth(prev3), "yyyy-MM-dd");
      e = format(endOfMonth(now), "yyyy-MM-dd");
    } else if (p === "current_year") {
      s = format(startOfYear(now), "yyyy-MM-dd");
      e = format(endOfYear(now), "yyyy-MM-dd");
    }

    if (s && e) {
      params.set("start", s);
      params.set("end", e);
    } else {
      params.delete("start");
      params.delete("end");
    }

    router.push(`/reports?${params.toString()}`);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      applyFilter("custom", customStart, customEnd);
    }
  };

  const handleExportCSV = () => {
    if (rawExpenses.length === 0) {
      toast.info("No expense data to export for this period.");
      return;
    }

    const exportRows: ExpenseColumnType[] = rawExpenses.map((exp) => ({
      id: exp.id,
      expenseDate: new Date(exp.expenseDate),
      amount: exp.amount,
      description: exp.description,
      category: { name: exp.category.name, icon: exp.category?.icon || "", color: exp.category?.color || "" },
      paymentMethod: { name: exp.paymentMethod.name, icon: exp.paymentMethod?.icon || "", color: exp.paymentMethod?.color || "" },
    }));

    downloadDataAsFile(exportRows, `reports-expenses-${new Date().toISOString().slice(0, 10)}`, "csv");
    toast.success(`Exported ${exportRows.length} expense records to CSV`);
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-xs">
      <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Preset Selector */}
          <Select value={preset} onValueChange={(val) => { if (val) { setPreset(val); applyFilter(val); } }}>
            <SelectTrigger className="h-10 rounded-xl min-w-44 bg-background">
              <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="current_week">This Week</SelectItem>
              <SelectItem value="current_month">This Month</SelectItem>
              <SelectItem value="prev_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="current_year">Current Year</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom Date Inputs */}
          {preset === "custom" && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-10 rounded-xl"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-10 rounded-xl"
              />
              <Button onClick={handleCustomApply} variant="secondary" className="h-10 rounded-xl font-semibold">
                Apply
              </Button>
            </div>
          )}
        </div>

        {/* CSV Export Action Button */}
        <Button onClick={handleExportCSV} variant="outline" className="h-10 rounded-xl font-semibold shrink-0">
          <Download className="mr-1.5 h-4 w-4 text-primary" /> Export CSV
        </Button>
      </CardContent>
    </Card>
  );
}