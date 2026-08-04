"use client";

import { useState, useTransition } from "react";
import { Coffee, Utensils, Car, ShoppingBag, Cookie, Zap, Undo2, Loader2 } from "lucide-react";
import { submitQuickEntry } from "../actions/quick-entry";
import { deleteActivity } from "@/features/activity/actions/activity";
import { toast } from "sonner";
import { formatMoney } from "@/lib/finance";

interface DailyQuickChipsProps {
  categories: Array<{ id: string; name: string }>;
  paymentMethods: Array<{ id: string; name: string }>;
}

const DEFAULT_CHIPS = [
  { label: "Coffee", amount: 50, icon: Coffee, categoryName: "Food & Dining" },
  { label: "Lunch", amount: 150, icon: Utensils, categoryName: "Food & Dining" },
  { label: "Commute", amount: 40, icon: Car, categoryName: "Transport" },
  { label: "Snacks", amount: 30, icon: Cookie, categoryName: "Food & Dining" },
  { label: "Groceries", amount: 300, icon: ShoppingBag, categoryName: "Groceries" },
];

export function DailyQuickChips({ categories, paymentMethods }: DailyQuickChipsProps) {
  const [isPending, startTransition] = useTransition();
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const defaultCategory = categories[0]?.id;
  const defaultPayment = paymentMethods[0]?.id;

  const handleQuickAdd = (chip: typeof DEFAULT_CHIPS[0]) => {
    if (!defaultPayment) {
      toast.error("Please add at least one payment method in Settings first!");
      return;
    }

    // Match category by name or fallback to first
    const matchedCategory = categories.find(c => 
      c.name.toLowerCase().includes(chip.categoryName.toLowerCase()) || 
      chip.categoryName.toLowerCase().includes(c.name.toLowerCase())
    )?.id || defaultCategory;

    if (!matchedCategory) {
      toast.error("Please add a category first!");
      return;
    }

    setActiveChip(chip.label);
    startTransition(async () => {
      try {
        const res = await submitQuickEntry({
          amount: chip.amount,
          description: chip.label,
          type: "EXPENSE",
          categoryId: matchedCategory,
          paymentMethodId: defaultPayment,
          date: new Date(),
        });

        if (res?.success && res.id) {
          const addedId = res.id;
          const addedType = res.type;

          toast.success(
            <div className="flex items-center justify-between w-full gap-3">
              <div>
                <span className="font-semibold text-sm block">Logged {chip.label}</span>
                <span className="text-xs text-muted-foreground">{formatMoney(chip.amount * 100)}</span>
              </div>
              <button
                onClick={() => {
                  deleteActivity(addedId, addedType);
                  toast.dismiss();
                  toast.info(`Undid ${chip.label}`);
                }}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
              >
                <Undo2 className="h-3 w-3" /> Undo
              </button>
            </div>,
            { duration: 5000 }
          );
        }
      } catch {
        toast.error(`Failed to add ${chip.label}`);
      } finally {
        setActiveChip(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2.5 bg-card border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500 fill-amber-500/20" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">1-Tap Daily Expense</span>
        </div>
        <span className="text-[11px] text-muted-foreground">Tap to log instantly</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
        {DEFAULT_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const isLoading = isPending && activeChip === chip.label;

          return (
            <button
              key={chip.label}
              disabled={isPending}
              onClick={() => handleQuickAdd(chip)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-transparent transition-all duration-200 active:scale-95 disabled:opacity-50 shrink-0 text-sm font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              ) : (
                <Icon className="h-4 w-4 text-primary shrink-0" />
              )}
              <span>{chip.label}</span>
              <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">
                ৳{chip.amount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
