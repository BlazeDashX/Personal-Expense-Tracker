"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveTransaction } from "@/features/transactions/actions/transaction-actions";
import { createInlinePerson } from "@/features/settings/actions/settings-actions";
import { deleteActivity } from "@/features/activity/actions/activity";
import { toast } from "sonner";
import { formatMoney, toMinorUnits } from "@/lib/finance";
import { Undo2, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
}

export function LoanForm({
  onCancel,
  paymentMethods = [],
  people: initialPeople = [],
}: {
  onCancel: () => void;
  paymentMethods?: LookupItem[];
  people?: LookupItem[];
}) {
  const [direction, setDirection] = useState<"LOAN_GIVEN" | "BORROWED">("LOAN_GIVEN");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [personId, setPersonId] = useState(initialPeople[0]?.id || "");
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Person Creation State
  const [peopleList, setPeopleList] = useState<LookupItem[]>(initialPeople);
  const [isCreatingPerson, setIsCreatingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [isSavingPerson, setIsSavingPerson] = useState(false);

  const handleCreatePerson = async () => {
    if (!newPersonName.trim()) return;
    try {
      setIsSavingPerson(true);
      const res = await createInlinePerson(newPersonName);
      if (res.success && res.person) {
        setPeopleList((prev) => [...prev, res.person!]);
        setPersonId(res.person.id);
        setNewPersonName("");
        setIsCreatingPerson(false);
        toast.success(`Added ${res.person.name}`);
      } else {
        toast.error(res.error || "Failed to add person");
      }
    } catch {
      toast.error("Failed to add person");
    } finally {
      setIsSavingPerson(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!personId) {
      toast.error("Please select or add a person for this loan.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await saveTransaction({
        type: direction,
        amount: parsedAmount,
        notes: description || (direction === "LOAN_GIVEN" ? "Lent Money" : "Borrowed Money"),
        personId,
        paymentMethodId,
        transactionDate: new Date(date),
      });

      if (res.success && res.id) {
        const addedId = res.id;
        const personName = peopleList.find((p) => p.id === personId)?.name || "Person";
        const label = direction === "LOAN_GIVEN" ? `Lent to ${personName}` : `Borrowed from ${personName}`;

        toast.success(
          <div className="flex items-center justify-between w-full gap-3">
            <div>
              <span className="font-semibold text-sm block">{label}</span>
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {formatMoney(toMinorUnits(parsedAmount))}
              </span>
            </div>
            <button
              onClick={() => {
                deleteActivity(addedId, direction);
                toast.dismiss();
                toast.info("Undid loan record");
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
        toast.error(res.error || "Failed to save loan record");
      }
    } catch {
      toast.error("Failed to save loan record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Direction Toggle */}
      <div className="grid grid-cols-2 p-1 bg-muted rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setDirection("LOAN_GIVEN")}
          className={cn(
            "py-2 px-3 text-xs font-bold rounded-xl transition-colors text-center",
            direction === "LOAN_GIVEN"
              ? "bg-card text-amber-500 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          🤝 I Lent Money (Given)
        </button>
        <button
          type="button"
          onClick={() => setDirection("BORROWED")}
          className={cn(
            "py-2 px-3 text-xs font-bold rounded-xl transition-colors text-center",
            direction === "BORROWED"
              ? "bg-card text-indigo-500 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          📥 I Borrowed Money
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="loan-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">৳</span>
          <Input
            id="loan-amount"
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

      {/* Person Selection + Inline Addition */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label>Person (Required)</Label>
          <button
            type="button"
            onClick={() => setIsCreatingPerson(!isCreatingPerson)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> {isCreatingPerson ? "Select Existing" : "Add New Person"}
          </button>
        </div>

        {isCreatingPerson ? (
          <div className="flex gap-2">
            <Input
              placeholder="Person name (e.g. Rahat, Brother)"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              disabled={isSavingPerson}
              className="h-12"
            />
            <Button
              type="button"
              onClick={handleCreatePerson}
              disabled={isSavingPerson || !newPersonName.trim()}
              className="h-12 px-4 shrink-0"
            >
              {isSavingPerson ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        ) : (
          <Select value={personId} onValueChange={(val) => setPersonId(val || "")} disabled={isSubmitting} required>
            <SelectTrigger className="h-12 bg-muted/50">
              <SelectValue placeholder="Select Person" />
            </SelectTrigger>
            <SelectContent>
              {peopleList.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Payment Method</Label>
          <Select value={paymentMethodId} onValueChange={(val) => setPaymentMethodId(val || "")} disabled={isSubmitting} required>
            <SelectTrigger className="h-12 bg-muted/50">
              <SelectValue placeholder="Select Method" />
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="loan-date">Date</Label>
          <Input
            id="loan-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isSubmitting}
            className="h-12"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="loan-desc">Note (Optional)</Label>
        <Input
          id="loan-desc"
          placeholder="E.g. Lunch split, emergency loan"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-3 mt-4">
        <Button type="button" variant="outline" className="flex-1 h-12" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          className={cn(
            "flex-1 h-12 text-white",
            direction === "LOAN_GIVEN" ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
          )}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : direction === "LOAN_GIVEN" ? "Save Loan Given" : "Save Borrowed"}
        </Button>
      </div>
    </form>
  );
}
