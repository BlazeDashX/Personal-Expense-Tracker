"use client";

import { format, subDays } from "date-fns";
import { formatMoney, toMinorUnits } from "@/lib/finance";

export function WeeklyCalendar() {
  const days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));

  // Mock data for the layout structure
  const mockData = [
    { amount: 420, meals: 2 },
    { amount: 0, meals: 3 },
    { amount: 850, meals: 2 },
    { amount: 120, meals: 1 },
    { amount: 500, meals: 3 },
    { amount: 300, meals: 2 },
    { amount: 0, meals: 0 },
  ];

  return (
    <div className="flex w-full overflow-x-auto snap-x hide-scrollbar gap-2 pb-2">
      {days.map((date, i) => {
        const isToday = i === 6;
        const data = mockData[i];
        return (
          <button 
            key={i} 
            className={`flex flex-col items-center justify-between min-w-18 flex-1 p-3 rounded-2xl snap-center transition-colors border
              ${isToday ? 'bg-primary border-primary text-primary-foreground shadow-md scale-105 origin-bottom' : 'bg-card border-muted text-muted-foreground hover:bg-muted'}`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">{format(date, "EEE")}</span>
              <span className={`text-xl font-bold ${isToday ? 'text-primary-foreground' : 'text-foreground'}`}>{format(date, "d")}</span>
            </div>
            
            <div className="mt-3 flex flex-col items-center gap-1 w-full">
              <span className={`text-xs font-semibold font-mono tabular-nums ${isToday ? 'text-primary-foreground/90' : 'text-foreground'}`}>
                {data.amount > 0 ? formatMoney(toMinorUnits(data.amount)) : '-'}
              </span>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 3 }).map((_, m) => (
                  <div 
                    key={m} 
                    className={`h-1.5 w-1.5 rounded-full ${m < data.meals ? (isToday ? 'bg-primary-foreground' : 'bg-primary') : (isToday ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20')}`}
                  />
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
