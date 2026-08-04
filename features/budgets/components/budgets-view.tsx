"use client";

import { useState, useTransition } from "react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Compass,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Amount } from "@/components/shared/amount";
import { formatMoney, toMinorUnits } from "@/lib/finance";
import { saveCategoryBudget, deleteCategoryBudget } from "../actions/category-budget-actions";
import { saveBudget } from "@/features/settings/actions/settings-actions";
import { getDaysInMonth } from "date-fns";
import { cn } from "@/lib/utils";
import type { BudgetsPageData } from "../queries/get-budgets-data";

type IconComponent = React.ComponentType<{ className?: string }>;
const iconMap = Icons as unknown as Record<string, IconComponent>;

export function BudgetsView({ data }: { data: BudgetsPageData }) {
  const [isPending, startTransition] = useTransition();

  // Dialog States
  const [isMonthlyDialogOpen, setIsMonthlyDialogOpen] = useState(false);
  const [monthlyAmountInput, setMonthlyAmountInput] = useState(data.monthlyBudget?.amount || 0);

  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [editingCatBudget, setEditingCatBudget] = useState<{
    id?: string;
    categoryId: string;
    amount: number;
    period: string;
    warningThreshold: number;
  } | null>(null);

  const [deletingCatBudgetId, setDeletingCatBudgetId] = useState<string | null>(null);

  // Safe Daily Allowance Calculation
  const now = new Date();
  const daysInMonth = getDaysInMonth(now);
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  const monthlyBudgetAmount = data.monthlyBudget?.amount || 0;
  const budgetRemaining = monthlyBudgetAmount - data.totalMonthSpent;
  const safeDailyAllowance = monthlyBudgetAmount > 0 ? Math.max(0, Math.round(budgetRemaining / daysRemaining)) : 0;
  const overallPercentage = monthlyBudgetAmount > 0 ? Math.min(100, Math.round((data.totalMonthSpent / monthlyBudgetAmount) * 100)) : 0;

  // Handlers
  const handleSaveMonthlyBudget = () => {
    if (monthlyAmountInput <= 0) return;
    startTransition(async () => {
      const budgetMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const res = await saveBudget({
        id: data.monthlyBudget?.id,
        budgetMonth: budgetMonthStr,
        amount: monthlyAmountInput,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Monthly budget updated!");
        setIsMonthlyDialogOpen(false);
      }
    });
  };

  const handleOpenCatModal = (catId: string, existing?: typeof data.budgetedCards[number]) => {
    if (existing) {
      setEditingCatBudget({
        id: existing.id,
        categoryId: existing.categoryId,
        amount: existing.amount,
        period: existing.period,
        warningThreshold: existing.warningThreshold,
      });
    } else {
      setEditingCatBudget({
        categoryId: catId,
        amount: 5000,
        period: "monthly",
        warningThreshold: 80,
      });
    }
    setIsCatDialogOpen(true);
  };

  const handleSaveCatBudget = () => {
    if (!editingCatBudget || editingCatBudget.amount <= 0) return;
    startTransition(async () => {
      const res = await saveCategoryBudget(editingCatBudget);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Category budget saved!");
        setIsCatDialogOpen(false);
      }
    });
  };

  const handleDeleteCatBudget = (id: string) => {
    startTransition(async () => {
      const res = await deleteCategoryBudget(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Category budget removed.");
        setDeletingCatBudgetId(null);
      }
    });
  };

  const hasAnyBudgets = monthlyBudgetAmount > 0 || data.budgetedCards.length > 0;

  if (!hasAnyBudgets) {
    /* 5. Empty state for a user with zero budgets */
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-dashed shadow-xs gap-4 max-w-2xl mx-auto my-8">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <Target className="h-10 w-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-black text-2xl text-foreground tracking-tight">Take Control of Your Spending with Budgets</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
            Setting a monthly budget powers the dashboard&apos;s <strong>Daily Safe Allowance</strong> pacing and warns you before you overspend in key categories.
          </p>
        </div>
        <Button
          onClick={() => {
            setMonthlyAmountInput(30000);
            setIsMonthlyDialogOpen(true);
          }}
          className="mt-2 rounded-xl px-6 font-semibold"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Set Your First Budget
        </Button>

        {/* Monthly Budget Dialog */}
        <Dialog open={isMonthlyDialogOpen} onOpenChange={setIsMonthlyDialogOpen}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Monthly Budget Target</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Total Monthly Budget (BDT ৳)</Label>
                <Input
                  type="number"
                  value={monthlyAmountInput || ""}
                  onChange={(e) => setMonthlyAmountInput(e.target.valueAsNumber || 0)}
                  placeholder="e.g. 30000"
                  className="rounded-xl font-mono text-base"
                />
              </div>
              <Button onClick={handleSaveMonthlyBudget} disabled={isPending} className="w-full rounded-xl font-semibold">
                Save Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Overall Monthly Budget Card */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-linear-to-br from-card via-card to-primary/5 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Overall Monthly Budget</span>
            <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-foreground tracking-tight flex items-baseline gap-2 mt-0.5">
              <Amount amount={toMinorUnits(monthlyBudgetAmount)} className="text-3xl sm:text-4xl font-black" />
            </div>
          </div>

          <Button
            onClick={() => {
              setMonthlyAmountInput(monthlyBudgetAmount);
              setIsMonthlyDialogOpen(true);
            }}
            variant="outline"
            className="rounded-xl font-semibold shrink-0 bg-background"
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Monthly Target
          </Button>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">
              Spent {formatMoney(toMinorUnits(data.totalMonthSpent))} of {formatMoney(toMinorUnits(monthlyBudgetAmount))}
            </span>
            <span className="font-mono tabular-nums text-primary">{overallPercentage}%</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                overallPercentage > 80 ? "bg-rose-500" : overallPercentage > 60 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>

        {/* Pacing Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-card/60 border border-primary/20 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Daily Safe Allowance</span>
              <span className="text-base font-bold font-mono tabular-nums text-foreground">
                {formatMoney(toMinorUnits(safeDailyAllowance))}/day
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card/60 border border-border flex items-center gap-3">
            <div className="p-2 rounded-xl bg-muted text-muted-foreground shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Remaining Days</span>
              <span className="text-base font-bold font-mono tabular-nums text-foreground">
                {daysRemaining} days left in month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Budgets & Warning Threshold Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Category Budgets</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set spending limits and warning thresholds per category.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Budgeted Category Cards */}
          {data.budgetedCards.map((card) => {
            const IconComp = iconMap[card.categoryIcon || ""] || Icons.Tag;
            const color = card.categoryColor || "#e7a33e";

            return (
              <div
                key={card.id}
                className={cn(
                  "p-5 rounded-2xl border bg-card shadow-xs flex flex-col justify-between space-y-4 transition-all relative",
                  card.isWarning && "border-rose-500/50 shadow-rose-500/10 ring-1 ring-rose-500/30"
                )}
              >
                {/* Header: Icon + Category + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{card.categoryName}</h4>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">{card.period}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenCatModal(card.categoryId, card)} className="h-7 w-7 p-0 rounded-lg">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingCatBudgetId(card.id)} className="h-7 w-7 p-0 rounded-lg text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Progress & Amounts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground font-mono tabular-nums">
                      {formatMoney(toMinorUnits(card.spent))} / {formatMoney(toMinorUnits(card.amount))}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-foreground">{card.percentage}%</span>
                  </div>

                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        card.percentage > 80 ? "bg-rose-500" : card.percentage > 60 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(100, card.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* 2. Warning Threshold Alert Badge */}
                {card.isWarning && (
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px] font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{card.percentage}% of budget used (warning threshold: {card.warningThreshold}%)</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* 4. Unbudgeted Categories ("Set a budget" cards) */}
          {data.unbudgetedCategories.map((cat) => {
            const IconComp = iconMap[cat.icon || ""] || Icons.Tag;
            const color = cat.color || "#e7a33e";

            return (
              <div
                key={cat.id}
                className="p-5 rounded-2xl border border-dashed bg-card/40 hover:bg-card/80 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl shrink-0 flex items-center justify-center opacity-60" style={{ backgroundColor: `${color}20`, color }}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{cat.name}</h4>
                    <span className="text-[11px] text-muted-foreground">Unbudgeted</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenCatModal(cat.id)}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl text-xs font-semibold border-dashed"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Set Budget
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Budget Dialog */}
      <Dialog open={isMonthlyDialogOpen} onOpenChange={setIsMonthlyDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Monthly Budget Target</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Total Monthly Budget (BDT ৳)</Label>
              <Input
                type="number"
                value={monthlyAmountInput || ""}
                onChange={(e) => setMonthlyAmountInput(e.target.valueAsNumber || 0)}
                placeholder="e.g. 30000"
                className="rounded-xl font-mono text-base"
              />
            </div>
            <Button onClick={handleSaveMonthlyBudget} disabled={isPending} className="w-full rounded-xl font-semibold">
              Save Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Budget Dialog */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCatBudget?.id ? "Edit Category Budget" : "Set Category Budget"}</DialogTitle>
          </DialogHeader>
          {editingCatBudget && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Target Category</Label>
                <Select
                  value={editingCatBudget.categoryId}
                  onValueChange={(val) => { if (val) setEditingCatBudget({ ...editingCatBudget, categoryId: val }); }}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-background">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {data.categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Budget Amount (BDT ৳)</Label>
                <Input
                  type="number"
                  value={editingCatBudget.amount || ""}
                  onChange={(e) => setEditingCatBudget({ ...editingCatBudget, amount: e.target.valueAsNumber || 0 })}
                  className="rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Period</Label>
                  <Select
                    value={editingCatBudget.period}
                    onValueChange={(val) => { if (val) setEditingCatBudget({ ...editingCatBudget, period: val }); }}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Warning Threshold (%)</Label>
                  <Input
                    type="number"
                    min="50"
                    max="99"
                    value={editingCatBudget.warningThreshold}
                    onChange={(e) => setEditingCatBudget({ ...editingCatBudget, warningThreshold: e.target.valueAsNumber || 80 })}
                    className="rounded-xl font-mono"
                  />
                </div>
              </div>

              <Button onClick={handleSaveCatBudget} disabled={isPending} className="w-full rounded-xl font-semibold">
                Save Category Budget
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Category Budget AlertDialog */}
      <AlertDialog open={!!deletingCatBudgetId} onOpenChange={(o) => { if (!o) setDeletingCatBudgetId(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Category Budget?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the budget limit for this category?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingCatBudgetId && handleDeleteCatBudget(deletingCatBudgetId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Remove Limit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
