"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import {
  Sparkles,
  Wallet,
  Check,
  Plus,
  ArrowRight,
  Compass,
  UtensilsCrossed,
  X,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/shared/icon-picker";
import {
  completeOnboardingStep1,
  completeOnboardingStep3,
  completeOnboardingStep4,
  finishOnboarding,
} from "../actions/onboarding-actions";
import { saveCategory } from "@/features/settings/actions/settings-actions";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "../queries/get-onboarding";

type IconComponent = React.ComponentType<{ className?: string }>;
const iconMap = Icons as unknown as Record<string, IconComponent>;

export function OnboardingWizard({ data }: { data: OnboardingData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);

  // Step 1 State: Payment Method
  const [pmName, setPmName] = useState(data.paymentMethods[0]?.name || "Cash");
  const [pmIcon, setPmIcon] = useState(data.paymentMethods[0]?.icon || "Wallet");
  const [pmColor, setPmColor] = useState(data.paymentMethods[0]?.color || "#10b981");

  // Step 2 State: Categories
  const categoriesList = data.categories;
  const [selectedCatIds, setSelectedCatIds] = useState<Set<string>>(
    new Set(data.categories.map((c) => c.id))
  );
  const [newCatName, setNewCatName] = useState("");

  // Step 3 State: Monthly Budget
  const [budgetInput, setBudgetInput] = useState<number>(data.budgetAmount || 30000);

  // Step 4 State: Meal Target
  const [mealTargetInput, setMealTargetInput] = useState<number>(data.prefs.mealTarget || 3);

  // Exit Early Handler
  const handleExitToDashboard = () => {
    startTransition(async () => {
      await finishOnboarding();
      toast.success("Welcome to Expense Tracker!");
      router.push("/dashboard?welcome=1");
    });
  };

  // Step 1 Submit
  const handleStep1Submit = () => {
    if (!pmName.trim()) return;
    startTransition(async () => {
      const res = await completeOnboardingStep1({ name: pmName, icon: pmIcon, color: pmColor });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Payment method saved!");
        setStep(2);
      }
    });
  };

  // Step 2 Add Category
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    startTransition(async () => {
      const slug = newCatName.toLowerCase().replace(/\s+/g, "-");
      const res = await saveCategory({ name: newCatName, slug, icon: "Tag", color: "#e7a33e" });
      if (res.error) toast.error(res.error);
      else {
        toast.success(`Category "${newCatName}" added!`);
        setNewCatName("");
      }
    });
  };

  // Step 3 Submit
  const handleStep3Submit = () => {
    startTransition(async () => {
      const res = await completeOnboardingStep3(budgetInput);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Monthly budget target set!");
        setStep(4);
      }
    });
  };

  // Step 4 Submit (Finish)
  const handleStep4Submit = () => {
    startTransition(async () => {
      await completeOnboardingStep4(mealTargetInput);
      await finishOnboarding();
      toast.success("Setup complete! Welcome to your dashboard.");
      router.push("/dashboard?welcome=1");
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-6 px-4">
      {/* 3. Progress Header with Skip Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Step {step} of 4</span>
          </div>

          <button
            type="button"
            onClick={handleExitToDashboard}
            disabled={isPending}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <span>Skip setup & go to Dashboard</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Segmented Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                step >= s ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Wizard Steps Container */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-card shadow-lg space-y-6">
        {/* Step 1: Payment Method */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <Wallet className="h-6 w-6 text-emerald-500" /> Welcome! Add Your First Payment Account
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add the primary account or wallet you use for daily expenses (e.g. <strong>Cash</strong>, bKash, or Bank).
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Account Name</Label>
                <Input
                  value={pmName}
                  onChange={(e) => setPmName(e.target.value)}
                  placeholder="e.g. Cash, bKash, Bank"
                  className="rounded-xl h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Icon</Label>
                  <IconPicker value={pmIcon} onChange={setPmIcon} color={pmColor} />
                </div>
                <div className="space-y-1">
                  <Label>Color Accent</Label>
                  <Input
                    type="color"
                    value={pmColor}
                    onChange={(e) => setPmColor(e.target.value)}
                    className="h-10 px-1 rounded-xl cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Skip this step
              </button>
              <Button onClick={handleStep1Submit} disabled={isPending || !pmName.trim()} className="rounded-xl font-semibold px-6">
                Save & Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Categories */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <Target className="h-6 w-6 text-amber-500" /> Confirm Your Expense Categories
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We&apos;ve pre-configured default categories for your daily expense logging.
              </p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {categoriesList.map((cat) => {
                const IconComp = iconMap[cat.icon] || Icons.Tag;
                const isSelected = selectedCatIds.has(cat.id);
                const color = cat.color || "#e7a33e";

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCatIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(cat.id)) next.delete(cat.id);
                        else next.add(cat.id);
                        return next;
                      });
                    }}
                    className={cn(
                      "p-3 rounded-2xl border flex items-center justify-between transition-all text-left",
                      isSelected ? "border-primary bg-primary/10" : "bg-muted/30 border-border opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
                        <IconComp className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold truncate text-foreground">{cat.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Add Custom Category */}
            <div className="flex gap-2 pt-2">
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Add custom category name..."
                className="h-10 text-xs rounded-xl"
              />
              <Button type="button" onClick={handleAddCategory} variant="outline" className="h-10 px-3 rounded-xl shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
              <Button onClick={() => setStep(3)} disabled={isPending} className="rounded-xl font-semibold px-6">
                Save & Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Monthly Budget (Single Most Important Step) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold text-xs border border-emerald-500/20 mb-1">
                <Compass className="h-3.5 w-3.5" /> Most Important Step
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Set Your Monthly Budget Target
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                See how much you can <strong>safely spend today</strong>! Setting a monthly budget target powers the dashboard&apos;s <strong>Daily Safe Allowance</strong> pacing algorithm.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-linear-to-r from-primary/10 via-card to-emerald-500/10 border space-y-2">
              <Label className="text-xs font-semibold text-foreground">Total Monthly Budget Target (BDT ৳)</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">৳</span>
                <Input
                  type="number"
                  value={budgetInput || ""}
                  onChange={(e) => setBudgetInput(e.target.valueAsNumber || 0)}
                  placeholder="e.g. 30000"
                  className="text-2xl font-black h-14 pl-9 font-mono rounded-xl bg-background"
                />
              </div>
              <p className="text-[11px] text-muted-foreground italic pt-1">
                💡 Tip: You can adjust or create category budgets anytime on the Budgets page.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
              <Button onClick={handleStep3Submit} disabled={isPending || budgetInput <= 0} className="rounded-xl font-semibold px-6">
                Save & Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Daily Meal Habit Target */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-primary" /> Daily Meal Habit Target
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Set your daily meal habit target to power your habit streak calendar.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-foreground">Meals Target Per Day</Label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setMealTargetInput(count)}
                    className={cn(
                      "p-3 rounded-2xl border font-mono font-bold text-center transition-all flex flex-col items-center justify-center gap-1",
                      mealTargetInput === count
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/40 hover:bg-muted text-foreground"
                    )}
                  >
                    <span className="text-lg">{count}</span>
                    <span className="text-[10px] font-normal opacity-80">{count === 3 ? "Default" : "meals"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button
                type="button"
                onClick={handleExitToDashboard}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
              <Button onClick={handleStep4Submit} disabled={isPending} className="rounded-xl font-semibold px-6 bg-emerald-600 hover:bg-emerald-700 text-white">
                Finish & Go to Dashboard <Check className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
