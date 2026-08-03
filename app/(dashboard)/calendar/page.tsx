// file: app/(dashboard)/calendar/page.tsx
import { getCalendarData } from "@/features/calendar/queries/get-calendar-data";
import { FinancialCalendar } from "@/features/calendar/components/financial-calendar";
import { parseISO, isValid } from "date-fns";

// In Next.js 15, searchParams is a promise
interface CalendarPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  // Await the searchParams promise (Next.js 15 requirement)
  const resolvedParams = await searchParams;
  
  const monthParam = resolvedParams.month;
  
  // Parse the month from URL or default to today
  let targetMonth = new Date();
  if (monthParam) {
    const parsed = parseISO(`${monthParam}-01`);
    if (isValid(parsed)) {
      targetMonth = parsed;
    }
  }

  const data = await getCalendarData(targetMonth);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Financial Calendar</h1>
        <p className="text-muted-foreground">Monthly visualization of your spending and activity.</p>
      </div>

      <FinancialCalendar currentMonth={targetMonth} data={data} />
    </div>
  );
}