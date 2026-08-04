"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveTransaction } from "@/features/transactions/actions/transaction-actions";
import { deleteActivity } from "@/features/activity/actions/activity";
import { toast } from "sonner";
import { formatMoney, toMinorUnits } from "@/lib/finance";
import { Undo2 } from "lucide-react";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
}

export function IncomeForm({
  onCancel,
  paymentMethods = [],
}: {
  onCancel: () => void;
  paymentMethods?: LookupItem[];
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!paymentMethodId) {
      toast.error("Please select a payment method.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await saveTransaction({
        type: "CASH_IN",
        amount: parsedAmount,
        notes: description || "Income",
        paymentMethodId,
        transactionDate: new Date(date),
      });

      if (res.success && res.id) {
        const addedId = res.id;
        toast.success(
          <div className="flex items-center justify-between w-full gap-3">
            <div>
              <span className="font-semibold text-sm block">Logged Income</span>
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {formatMoney(toMinorUnits(parsedAmount))}
              </span>
            </div>
            <button
              onClick={() => {
                deleteActivity(addedId, "CASH_IN");
                toast.dismiss();
                toast.info("Undid income entry");
              }}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
            >
              <Undo2 className="h-3 w-3" /> Undo
            </button>
          </div>,
          { duration: 5000 }
        );
        onCancel();
      } else {
        toast.error(res.error || "Failed to save income");
      }
    } catch {
      toast.error("Failed to save income");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="income-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">৳</span>
          <Input
            id="income-amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
            disabled={isSubmitting}
            className="text-2xl font-semibold h-14 pl-8 font-mono tabular-nums"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="income-desc">Source / Note</Label>
        <Input
          id="income-desc"
          placeholder="E.g., Salary, Freelance, Gift"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-1">
        <div className="flex flex-col gap-2">
          <Label>Deposit Account</Label>
          <Select
            value={paymentMethodId}
            onValueChange={(val) => setPaymentMethodId(val || "")}
            disabled={isSubmitting}
            required
          >
            <SelectTrigger className="h-12 bg-muted/50">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    {p.icon && <span>{p.icon}</span>}
                    <span>{p.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="income-date">Date</Label>
          <Input
            id="income-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isSubmitting}
            className="h-12"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="button" variant="outline" className="flex-1 h-12" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Income"}
        </Button>
      </div>
    </form>
  );
}
