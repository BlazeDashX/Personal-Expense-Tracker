// file: features/reports/components/report-filters.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ReportFilters() {
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

    if (p === "current_month") {
      s = format(startOfMonth(now), "yyyy-MM-dd");
      e = format(endOfMonth(now), "yyyy-MM-dd");
    } else if (p === "prev_month") {
      const prev = subMonths(now, 1);
      s = format(startOfMonth(prev), "yyyy-MM-dd");
      e = format(endOfMonth(prev), "yyyy-MM-dd");
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

  return (
    <Card>
      <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-62.5">
          <Select value={preset} onValueChange={(val) => { if (val) { setPreset(val); applyFilter(val); } }}>
            <SelectTrigger>
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="prev_month">Previous Month</SelectItem>
              <SelectItem value="current_year">Current Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {preset === "custom" && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full md:w-auto"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full md:w-auto"
            />
            <Button onClick={handleCustomApply} variant="secondary">Apply</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}