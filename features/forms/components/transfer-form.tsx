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
import { Undo2, ArrowRight } from "lucide-react";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
}

export function TransferForm({
  onCancel,
  paymentMethods = [],
}: {
  onCancel: () => void;
  paymentMethods?: LookupItem[];
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fromAccount, setFromAccount] = useState(paymentMethods[0]?.id || "");
  const [toAccount, setToAccount] = useState(paymentMethods[1]?.id || paymentMethods[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (fromAccount === toAccount) {
      toast.error("Destination account must be different from source account.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await saveTransaction({
        type: "TRANSFER",
        amount: parsedAmount,
        notes: description || "Transfer",
        paymentMethodId: fromAccount,
        destinationPaymentMethodId: toAccount,
        transactionDate: new Date(date),
      });

      if (res.success && res.id) {
        const addedId = res.id;
        const fromName = paymentMethods.find((p) => p.id === fromAccount)?.name || "Account";
        const toName = paymentMethods.find((p) => p.id === toAccount)?.name || "Account";

        toast.success(
          <div className="flex items-center justify-between w-full gap-3">
            <div>
              <span className="font-semibold text-sm block">Transferred Funds</span>
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {formatMoney(toMinorUnits(parsedAmount))} ({fromName} → {toName})
              </span>
            </div>
            <button
              onClick={() => {
                deleteActivity(addedId, "TRANSFER");
                toast.dismiss();
                toast.info("Undid transfer entry");
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
        toast.error(res.error || "Failed to save transfer");
      }
    } catch {
      toast.error("Failed to save transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="transfer-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">৳</span>
          <Input
            id="transfer-amount"
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

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-2 my-1">
        <div className="flex flex-col gap-2">
          <Label>From Account</Label>
          <Select value={fromAccount} onValueChange={(val) => setFromAccount(val || "")} disabled={isSubmitting} required>
            <SelectTrigger className="h-12 bg-muted/50">
              <SelectValue placeholder="From Account" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:flex items-center justify-center h-12 text-muted-foreground">
          <ArrowRight className="h-4 w-4" />
        </div>

        <div className="flex flex-col gap-2">
          <Label>To Account</Label>
          <Select value={toAccount} onValueChange={(val) => setToAccount(val || "")} disabled={isSubmitting} required>
            <SelectTrigger className="h-12 bg-muted/50">
              <SelectValue placeholder="To Account" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={p.id === fromAccount}>
                  {p.name} {p.id === fromAccount ? "(Same Account)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="transfer-desc">Note (Optional)</Label>
          <Input
            id="transfer-desc"
            placeholder="E.g. Bank to bKash"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="transfer-date">Date</Label>
          <Input
            id="transfer-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isSubmitting}
            className="h-10"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="button" variant="outline" className="flex-1 h-12" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Transfer Funds"}
        </Button>
      </div>
    </form>
  );
}
