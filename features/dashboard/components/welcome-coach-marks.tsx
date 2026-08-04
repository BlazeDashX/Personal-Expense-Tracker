"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Compass, PlusCircle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeCoachMarks() {
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";
  const [isVisible, setIsVisible] = useState(isWelcome);
  const [coachStep, setCoachStep] = useState(1);

  if (!isVisible) return null;

  return (
    <div className="p-5 rounded-3xl border bg-linear-to-r from-primary/15 via-card to-emerald-500/15 shadow-md space-y-4 relative animate-in fade-in-50 slide-in-from-top-3 duration-300">
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50"
      >
        <X className="h-4 w-4" />
      </button>

      {coachStep === 1 ? (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
            <Compass className="h-3.5 w-3.5" /> Feature Spotlight (1 of 2)
          </div>
          <h3 className="font-extrabold text-base text-foreground">
            Meet Your Signature Daily Safe Pacing Ring
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your monthly budget automatically calculates a real-time <strong>Safe Daily Allowance</strong> that adjusts dynamically every day so you stay on track without overspending.
          </p>
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={() => setCoachStep(2)} className="rounded-xl text-xs font-semibold px-4">
              Next Tip <Sparkles className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold text-xs border border-emerald-500/20">
            <PlusCircle className="h-3.5 w-3.5" /> Quick Actions (2 of 2)
          </div>
          <h3 className="font-extrabold text-base text-foreground">
            Fast 1-Tap Entry & Cmd+K Palette
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use the central <strong>+ Add</strong> button or press <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">⌘K</kbd> / <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">Ctrl+K</kbd> anywhere to quickly search records or log expenses, income, and loans.
          </p>
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={() => setIsVisible(false)} className="rounded-xl text-xs font-semibold px-4 bg-emerald-600 hover:bg-emerald-700 text-white">
              Got it, let&apos;s go! <Check className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
