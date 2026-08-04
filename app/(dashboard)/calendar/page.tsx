import { getCalendarPageData } from "@/features/calendar/queries/get-calendar-data";
import { FinancialCalendar } from "@/features/calendar/components/financial-calendar";
import { parseISO, isValid } from "date-fns";

interface CalendarPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const resolvedParams = await searchParams;
  const monthParam = resolvedParams.month;

  let targetMonth = new Date();
  if (monthParam) {
    const parsed = parseISO(`${monthParam}-01`);
    if (isValid(parsed)) {
      targetMonth = parsed;
    }
  }

  const { calendar, budgetAmount, lookups } = await getCalendarPageData(targetMonth);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Financial Calendar</h1>
        <p className="text-muted-foreground">Monthly visualization of your spending, transactions, and meal habit.</p>
      </div>

      <FinancialCalendar
        currentMonth={targetMonth}
        data={calendar}
        budgetAmount={budgetAmount}
        lookups={lookups}
      />
    </div>
  );
}