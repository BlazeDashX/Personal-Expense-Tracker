"use client";

import { useState, useTransition } from "react";
import * as Icons from "lucide-react";
import { submitQuickEntry } from "../actions/quick-entry";
import { deleteActivity } from "@/features/activity/actions/activity";
import { toast } from "sonner";
import { formatMoney, toMinorUnits } from "@/lib/finance";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Undo2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Shortcut {
  id: string;
  type: string;
  title: string;
  amount: number;
  categoryId: string | null;
  paymentMethodId: string;
  transactionType: string | null;
  icon: string;
  instantMode: number;
}

export function QuickWidgetGrid({ shortcuts }: { shortcuts: Shortcut[] }) {
  const [filter, setFilter] = useState<"ALL" | "EXPENSE" | "TRANSACTION">("ALL");

  if (!shortcuts || shortcuts.length === 0) return null;

  const filteredShortcuts = shortcuts.filter((s) => {
    if (filter === "ALL") return true;
    return s.type === filter;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Header with Type Filter Tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-bold tracking-tight text-foreground">
          Quick Shortcuts
        </h2>
        <div className="flex items-center gap-1 p-0.5 bg-muted/80 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
              filter === "ALL" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("EXPENSE")}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
              filter === "EXPENSE" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setFilter("TRANSACTION")}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
              filter === "TRANSACTION" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Income/Other
          </button>
        </div>
      </div>

      {/* Grid of User Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredShortcuts.map((item) => (
          <QuickWidgetItem key={item.id} shortcut={item} />
        ))}
      </div>
    </div>
  );
}

function QuickWidgetItem({ shortcut }: { shortcut: Shortcut }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [amountStr, setAmountStr] = useState((shortcut.amount / 100).toString());

  const IconComp = (Icons as unknown as Record<string, React.ElementType>)[shortcut.icon] || Icons.Zap;

  const executeAdd = async (customAmount?: number) => {
    const amountToUse = customAmount !== undefined ? customAmount : shortcut.amount / 100;
    if (isNaN(amountToUse) || amountToUse <= 0) return;

    try {
      const payload = {
        amount: amountToUse,
        description: shortcut.title,
        type: shortcut.transactionType || shortcut.type || "EXPENSE",
        categoryId: shortcut.categoryId || undefined,
        paymentMethodId: shortcut.paymentMethodId,
        date: new Date(),
      };

      const res = await submitQuickEntry(payload);

      if (res?.success && res.id) {
        const addedId = res.id;
        const entryType = res.type;

        toast.success(
          <div className="flex items-center justify-between w-full gap-3">
            <div>
              <span className="font-semibold text-sm block">Logged {shortcut.title}</span>
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {formatMoney(toMinorUnits(amountToUse))}
              </span>
            </div>
            <button
              onClick={() => {
                deleteActivity(addedId, entryType);
                toast.dismiss();
                toast.info(`Undid ${shortcut.title}`);
              }}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
            >
              <Undo2 className="h-3 w-3" /> Undo
            </button>
          </div>,
          { duration: 4000 }
        );
      }
      setIsOpen(false);
    } catch {
      toast.error(`Failed to add ${shortcut.title}`);
    }
  };

  const handleInstantClick = () => {
    if (shortcut.instantMode === 1) {
      startTransition(() => {
        executeAdd();
      });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amountStr);
    if (!isNaN(parsed) && parsed > 0) {
      startTransition(() => {
        executeAdd(parsed);
      });
    }
  };

  // 1-Tap Instant Button vs Amount Popover Button
  if (shortcut.instantMode === 1) {
    return (
      <button
        type="button"
        onClick={handleInstantClick}
        disabled={isPending}
        className={cn(
          "flex flex-col justify-between p-3.5 bg-card rounded-2xl border shadow-xs hover:shadow-md hover:border-primary/40 transition-all active:scale-95 text-left relative overflow-hidden group",
          isPending && "opacity-60 cursor-not-allowed"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <IconComp className="h-4 w-4" />
          </div>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
            <Zap className="h-2.5 w-2.5" /> 1-Tap
          </span>
        </div>

        <div className="mt-3">
          <h4 className="font-semibold text-xs text-foreground truncate">{shortcut.title}</h4>
          <span className="text-xs font-extrabold font-mono tabular-nums text-muted-foreground">
            {formatMoney(shortcut.amount)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) setAmountStr((shortcut.amount / 100).toString());
      }}
    >
      <PopoverTrigger
        className={cn(
          "flex flex-col justify-between p-3.5 bg-card rounded-2xl border shadow-xs hover:shadow-md hover:border-primary/40 transition-all active:scale-95 text-left group",
          isPending && "opacity-60 cursor-not-allowed"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="p-2 bg-muted text-muted-foreground rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <IconComp className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold font-mono tabular-nums px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
            {formatMoney(shortcut.amount)}
          </span>
        </div>
        <div className="mt-3">
          <h4 className="font-semibold text-xs text-foreground truncate">{shortcut.title}</h4>
          <span className="text-[10px] text-muted-foreground font-medium">Tap to edit amount</span>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-3 rounded-2xl border bg-popover shadow-lg" sideOffset={8}>
        <form onSubmit={handleCustomSubmit} className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">৳</span>
            <Input
              type="number"
              step="0.01"
              autoFocus
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="pl-7 h-10 font-bold font-mono tabular-nums"
              disabled={isPending}
            />
          </div>
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" disabled={isPending}>
            <Check className="h-4 w-4" />
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
