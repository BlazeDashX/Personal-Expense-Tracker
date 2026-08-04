import { getReportData } from "@/features/reports/queries/get-report-data";
import { ReportFilters } from "@/features/reports/components/report-filters";
import { SummaryMetrics } from "@/features/reports/components/summary-metrics";
import { ReportCharts } from "@/features/reports/components/report-charts";
import { startOfMonth, endOfMonth, parseISO, isValid } from "date-fns";

interface ReportsPageProps {
  searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const resolvedParams = await searchParams;

  const now = new Date();
  let startDate = startOfMonth(now);
  let endDate = endOfMonth(now);

  if (resolvedParams.start && resolvedParams.end) {
    const s = parseISO(resolvedParams.start);
    const e = parseISO(resolvedParams.end);
    if (isValid(s) && isValid(e)) {
      startDate = s;
      endDate = e;
      // Set endDate to end of day to include records logged at 23:59
      endDate.setHours(23, 59, 59, 999);
    }
  }

  const data = await getReportData(startDate, endDate);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto h-full pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your financial habits and trends.</p>
      </div>

      <ReportFilters rawExpenses={data.rawExpenses} />
      <SummaryMetrics metrics={data.metrics} />
      <ReportCharts
        expenseByCategory={data.expenseByCategory}
        trendData={data.trendData}
        cashFlowData={data.cashFlowData}
      />
    </div>
  );
}