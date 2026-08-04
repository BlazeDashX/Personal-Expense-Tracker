"use client";

import { useState, useTransition } from "react";
import { Utensils, Minus, Plus, Flame, CheckCircle2 } from "lucide-react";
import { incrementMealCount, decrementMealCount } from "../actions/meals";
import { Button } from "@/components/ui/button";

export function MealCounterWidget({ initialCount, target = 3 }: { initialCount: number; target?: number }) {
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleIncrement = () => {
    setCount((c) => c + 1);
    startTransition(async () => {
      await incrementMealCount(new Date().toISOString());
    });
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount((c) => c - 1);
      startTransition(async () => {
        await decrementMealCount(new Date().toISOString());
      });
    }
  };

  const isGoalReached = count >= target;
  const percent = Math.min(100, Math.round((count / target) * 100));

  return (
    <div className="flex flex-col p-5 bg-card rounded-2xl shadow-sm border relative overflow-hidden">
      {/* Background glow on goal completion */}
      {isGoalReached && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl transition-colors ${isGoalReached ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"}`}>
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight">Meals Today</h3>
            <span className="text-[11px] text-muted-foreground">Daily nutrition habit</span>
          </div>
        </div>

        {isGoalReached ? (
          <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" /> Goal Met!
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
            <Flame className="h-3.5 w-3.5 fill-amber-500" /> {count}/{target}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 relative z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-11 w-11 rounded-xl border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
          onClick={handleDecrement}
          disabled={count === 0 || isPending}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.max(target, count) }).map((_, i) => (
              <div 
                key={i} 
                className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                  i < count 
                    ? isGoalReached 
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/50 scale-105" 
                      : "bg-primary shadow-sm shadow-primary/50 scale-105" 
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <Button 
          size="icon" 
          className={`h-11 w-11 rounded-xl shadow-md transition-all duration-200 active:scale-95 ${
            isGoalReached 
              ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
          onClick={handleIncrement}
          disabled={isPending}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
