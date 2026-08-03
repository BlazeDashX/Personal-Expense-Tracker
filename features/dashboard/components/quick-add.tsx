// file: features/dashboard/components/quick-add.tsx
"use client";

import { useState } from "react";
import { Receipt, ArrowRightLeft, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { MealForm } from "@/features/meals/components/meal-form";
import type { Category, PaymentMethod, Person } from "@/features/settings/components/settings-panels";

interface QuickAddProps {
  categories: Category[];
  paymentMethods: PaymentMethod[];
  people: Person[];
}

export function QuickAdd({ categories, paymentMethods, people }: QuickAddProps) {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Quick Add</CardTitle>
        <CardDescription>Record new entries instantly.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={() => setExpenseOpen(true)} className="w-full justify-start" variant="outline">
          <Receipt className="mr-2 h-4 w-4" /> Add Expense
        </Button>
        <Button onClick={() => setTransactionOpen(true)} className="w-full justify-start" variant="outline">
          <ArrowRightLeft className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
        <Button onClick={() => setMealOpen(true)} className="w-full justify-start" variant="outline">
          <Utensils className="mr-2 h-4 w-4" /> Log Meal
        </Button>
      </CardContent>

      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <ExpenseForm categories={categories} paymentMethods={paymentMethods} onSuccess={() => setExpenseOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={transactionOpen} onOpenChange={setTransactionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
          <TransactionForm paymentMethods={paymentMethods} people={people} onSuccess={() => setTransactionOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={mealOpen} onOpenChange={setMealOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Daily Meal</DialogTitle></DialogHeader>
          <MealForm onSuccess={() => setMealOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}