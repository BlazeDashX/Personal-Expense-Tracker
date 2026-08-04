"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  UserPlus,
  HandCoins,
  ChevronDown,
  ChevronUp,
  Phone,
  StickyNote,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Amount } from "@/components/shared/amount";
import { toMinorUnits } from "@/lib/finance";
import { savePerson } from "@/features/settings/actions/settings-actions";
import { deleteActivity } from "@/features/activity/actions/activity";
import { LoanForm } from "@/features/forms/components/loan-form";
import { cn } from "@/lib/utils";
import type { PeoplePageData } from "../queries/get-people-data";

export function PeopleView({ data }: { data: PeoplePageData }) {
  const [isPending, startTransition] = useTransition();

  // Modals & Expand States
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [personNameInput, setPersonNameInput] = useState("");
  const [personPhoneInput, setPersonPhoneInput] = useState("");
  const [personNotesInput, setPersonNotesInput] = useState("");

  const [loanModalConfig, setLoanModalConfig] = useState<{
    isOpen: boolean;
    personId?: string;
    direction?: "LOAN_GIVEN" | "BORROWED" | "RETURNED";
  }>({ isOpen: false });

  const [expandedPersonIds, setExpandedPersonIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedPersonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSavePerson = () => {
    if (!personNameInput.trim()) return;
    startTransition(async () => {
      const res = await savePerson({
        name: personNameInput,
        phone: personPhoneInput || undefined,
        notes: personNotesInput || undefined,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success(`Contact ${personNameInput} added!`);
        setPersonNameInput("");
        setPersonPhoneInput("");
        setPersonNotesInput("");
        setIsAddPersonOpen(false);
      }
    });
  };

  const handleDeleteTx = (id: string, type: string) => {
    startTransition(async () => {
      try {
        const res = await deleteActivity(id, type);
        if (res?.success) toast.success("Record deleted.");
      } catch {
        toast.error("Failed to delete record.");
      }
    });
  };

  const hasPeople = data.people.length > 0;

  if (!hasPeople) {
    /* 5. Actionable Empty State */
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-dashed shadow-xs gap-4 max-w-2xl mx-auto my-8">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <HandCoins className="h-10 w-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-black text-2xl text-foreground tracking-tight">Track Informal Loans & Debts</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
            Keep track of money lent to friends or borrowed from contacts with automatic balance calculation and 2-tap repayment logging.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Button onClick={() => setIsAddPersonOpen(true)} className="rounded-xl px-5 font-semibold">
            <UserPlus className="mr-1.5 h-4 w-4" /> Add First Contact
          </Button>
          <Button
            onClick={() => setLoanModalConfig({ isOpen: true, direction: "LOAN_GIVEN" })}
            variant="outline"
            className="rounded-xl px-5 font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Log First Loan
          </Button>
        </div>

        {/* Add Person Dialog */}
        <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Contact Name (Required)</Label>
                <Input
                  value={personNameInput}
                  onChange={(e) => setPersonNameInput(e.target.value)}
                  placeholder="e.g. Rahat, Brother, Landlord"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label>Phone Number (Optional)</Label>
                <Input
                  value={personPhoneInput}
                  onChange={(e) => setPersonPhoneInput(e.target.value)}
                  placeholder="01700000000"
                  className="rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label>Notes (Optional)</Label>
                <Input
                  value={personNotesInput}
                  onChange={(e) => setPersonNotesInput(e.target.value)}
                  placeholder="e.g. Office colleague"
                  className="rounded-xl"
                />
              </div>
              <Button onClick={handleSavePerson} disabled={isPending || !personNameInput.trim()} className="w-full rounded-xl font-semibold">
                Save Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loan Form Dialog */}
        <Dialog open={loanModalConfig.isOpen} onOpenChange={(open) => setLoanModalConfig((prev) => ({ ...prev, isOpen: open }))}>
          <DialogContent className="rounded-2xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Record Loan or Borrowing</DialogTitle>
            </DialogHeader>
            <LoanForm
              onCancel={() => setLoanModalConfig({ isOpen: false })}
              people={data.people}
              paymentMethods={data.paymentMethods}
              initialPersonId={loanModalConfig.personId}
              initialDirection={loanModalConfig.direction}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Row + Unambiguous Sign Convention Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border bg-linear-to-br from-card via-card to-primary/5 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-primary" /> Informal Lending Overview
          </h2>
          {/* Explicit Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium pt-1">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <strong className="text-emerald-500">Positive (+):</strong> They owe you
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
              <strong className="text-rose-500">Negative (-):</strong> You owe them
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-muted-foreground inline-block" />
              <strong>Zero (৳0):</strong> Settled
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setIsAddPersonOpen(true)} variant="outline" className="rounded-xl font-semibold bg-background">
            <UserPlus className="mr-1.5 h-4 w-4" /> Add Person
          </Button>
          <Button
            onClick={() => setLoanModalConfig({ isOpen: true, direction: "LOAN_GIVEN" })}
            className="rounded-xl font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Record Loan
          </Button>
        </div>
      </div>

      {/* 6. People List (Sorted by Absolute Net Balance Descending) */}
      <div className="space-y-4">
        {data.people.map((person) => {
          const isExpanded = expandedPersonIds.has(person.id);
          const isTheyOwe = person.netBalance > 0;
          const isYouOwe = person.netBalance < 0;
          const isSettled = person.netBalance === 0;

          return (
            <div
              key={person.id}
              className={cn(
                "rounded-3xl border bg-card shadow-xs overflow-hidden transition-all",
                isTheyOwe && "border-emerald-500/30",
                isYouOwe && "border-rose-500/30"
              )}
            >
              {/* Person Summary Card */}
              <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0",
                      isTheyOwe && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                      isYouOwe && "bg-rose-500/10 text-rose-500 border border-rose-500/20",
                      isSettled && "bg-muted text-muted-foreground border"
                    )}
                  >
                    {person.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      {person.name}
                      {person.phone && (
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1 font-normal">
                          <Phone className="h-3 w-3" /> {person.phone}
                        </span>
                      )}
                    </h3>
                    {person.notes && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <StickyNote className="h-3 w-3" /> {person.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Net Balance & Actions */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      {isTheyOwe ? "They Owe You" : isYouOwe ? "You Owe Them" : "Net Balance"}
                    </span>
                    <div className="text-xl font-black font-mono tabular-nums">
                      <Amount
                        amount={toMinorUnits(Math.abs(person.netBalance))}
                        className={cn(
                          "text-xl font-black",
                          isTheyOwe && "text-emerald-500",
                          isYouOwe && "text-rose-500",
                          isSettled && "text-muted-foreground"
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 3. Quick "Record repayment" 2-Tap Action */}
                    {!isSettled && (
                      <Button
                        size="sm"
                        onClick={() =>
                          setLoanModalConfig({
                            isOpen: true,
                            personId: person.id,
                            direction: "RETURNED",
                          })
                        }
                        className="rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3 text-xs"
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Record Repayment
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleExpand(person.id)}
                      className="rounded-xl h-9 px-3 text-xs font-semibold"
                    >
                      {person.historyCount} Transactions
                      {isExpanded ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 2. Expandable Chronological Transaction History per Person */}
              {isExpanded && (
                <div className="border-t bg-muted/20 p-5 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Transaction History ({person.history.length})
                  </h4>

                  {person.history.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No transaction history recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {person.history.map((tx) => {
                        const isLent = tx.type === "LOAN_GIVEN";
                        const isRepayment = tx.type === "RETURNED";
                        const isBorrowed = tx.type === "BORROWED" || tx.type === "LOAN_RECEIVED";

                        return (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-3 rounded-2xl border bg-card hover:bg-muted/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "p-2 rounded-xl shrink-0 flex items-center justify-center",
                                  isLent && "bg-amber-500/10 text-amber-500",
                                  isBorrowed && "bg-indigo-500/10 text-indigo-500",
                                  isRepayment && "bg-emerald-500/10 text-emerald-500"
                                )}
                              >
                                {isLent && <ArrowUpRight className="h-4 w-4" />}
                                {isBorrowed && <ArrowDownLeft className="h-4 w-4" />}
                                {isRepayment && <RotateCcw className="h-4 w-4" />}
                              </div>

                              <div>
                                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                  {isLent ? "Lent Money" : isBorrowed ? "Borrowed Money" : "Repayment Received / Returned"}
                                </span>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-2">
                                  <span>{format(new Date(tx.date), "MMM d, yyyy")}</span>
                                  <span>•</span>
                                  <span>{tx.paymentMethodName}</span>
                                  {tx.notes && <span>• {tx.notes}</span>}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Amount
                                amount={toMinorUnits(tx.amount)}
                                className={cn(
                                  "font-bold text-sm font-mono tabular-nums",
                                  isLent && "text-amber-500",
                                  isBorrowed && "text-indigo-500",
                                  isRepayment && "text-emerald-500"
                                )}
                              />

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTx(tx.id, tx.type)}
                                className="h-7 w-7 p-0 rounded-lg text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Add Person Dialog */}
      <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Contact Name (Required)</Label>
              <Input
                value={personNameInput}
                onChange={(e) => setPersonNameInput(e.target.value)}
                placeholder="e.g. Rahat, Brother, Landlord"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone Number (Optional)</Label>
              <Input
                value={personPhoneInput}
                onChange={(e) => setPersonPhoneInput(e.target.value)}
                placeholder="01700000000"
                className="rounded-xl font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label>Notes (Optional)</Label>
              <Input
                value={personNotesInput}
                onChange={(e) => setPersonNotesInput(e.target.value)}
                placeholder="e.g. Office colleague"
                className="rounded-xl"
              />
            </div>
            <Button onClick={handleSavePerson} disabled={isPending || !personNameInput.trim()} className="w-full rounded-xl font-semibold">
              Save Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loan Form Modal */}
      <Dialog open={loanModalConfig.isOpen} onOpenChange={(open) => setLoanModalConfig((prev) => ({ ...prev, isOpen: open }))}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Loan or Repayment</DialogTitle>
          </DialogHeader>
          <LoanForm
            onCancel={() => setLoanModalConfig({ isOpen: false })}
            people={data.people}
            paymentMethods={data.paymentMethods}
            initialPersonId={loanModalConfig.personId}
            initialDirection={loanModalConfig.direction}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
