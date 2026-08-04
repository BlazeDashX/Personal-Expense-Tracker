"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateActivity } from "../../activity/actions/activity";
import { toast } from "sonner";
import type { UnifiedActivity } from "../../activity/queries/get-activity";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
}

export function EditActivitySheet({
  activity,
  open,
  onOpenChange,
  categories = [],
  paymentMethods = [],
  people = [],
}: {
  activity: UnifiedActivity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: LookupItem[];
  paymentMethods?: LookupItem[];
  people?: LookupItem[];
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [personId, setPersonId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevActivityId, setPrevActivityId] = useState<string | null>(null);

  if (activity && open && activity.id !== prevActivityId) {
    setPrevActivityId(activity.id);
    setAmount(activity.amount.toString());
    setDescription(activity.description);
    setDate(new Date(activity.date).toISOString().split('T')[0]);
    setCategoryId(activity.categoryId || "");
    setPaymentMethodId(activity.paymentMethodId || "");
    setPersonId(activity.personId || "");
  } else if (!open && prevActivityId !== null) {
    // Reset when closed so it can re-trigger when opened again
    setPrevActivityId(null);
  }

  if (!activity) return null;

  const isExpense = activity.type === "EXPENSE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      setIsSubmitting(true);
      await updateActivity(activity.id, activity.type, {
        amount: parsedAmount,
        description,
        date: new Date(date),
        categoryId: isExpense ? categoryId : undefined,
        paymentMethodId,
        personId: !isExpense && personId ? personId : undefined,
      });

      toast.success("Activity updated!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-full sm:w-100 sm:side-right sm:max-w-md rounded-t-3xl sm:rounded-none flex flex-col gap-0 p-0 border-none bg-background shadow-2xl">
        <SheetHeader className="px-6 pt-6 pb-2 text-left">
          <SheetTitle>Edit {isExpense ? "Expense" : "Transaction"}</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <form id="edit-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">৳</span>
                <Input 
                  id="edit-amount" 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  required 
                  disabled={isSubmitting}
                  className="text-2xl font-semibold h-14 pl-8"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input 
                id="edit-desc" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                required 
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input 
                id="edit-date" 
                type="date"
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required 
                disabled={isSubmitting}
              />
            </div>

            {isExpense && (
              <div className="flex flex-col gap-2">
                 <Label>Category</Label>
                 <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "")} disabled={isSubmitting} required>
                   <SelectTrigger className="h-12 bg-muted/50">
                     <SelectValue placeholder="Select Category" />
                   </SelectTrigger>
                   <SelectContent>
                     {categories.map(c => (
                       <SelectItem key={c.id} value={c.id}>
                         <span className="flex items-center gap-2">
                           <span>{c.icon}</span> {c.name}
                         </span>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
            )}

            {!isExpense && people.length > 0 && (
              <div className="flex flex-col gap-2">
                 <Label>Person (Optional)</Label>
                 <Select value={personId} onValueChange={(val) => setPersonId(val || "")} disabled={isSubmitting}>
                   <SelectTrigger className="h-12 bg-muted/50">
                     <SelectValue placeholder="Select Person" />
                   </SelectTrigger>
                   <SelectContent>
                     {people.map(p => (
                       <SelectItem key={p.id} value={p.id}>
                         <span className="flex items-center gap-2">{p.name}</span>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
            )}

            <div className="flex flex-col gap-2">
               <Label>Payment Method</Label>
               <Select value={paymentMethodId} onValueChange={(val) => setPaymentMethodId(val || "")} disabled={isSubmitting} required>
                 <SelectTrigger className="h-12 bg-muted/50">
                   <SelectValue placeholder="Select Method" />
                 </SelectTrigger>
                 <SelectContent>
                   {paymentMethods.map(p => (
                     <SelectItem key={p.id} value={p.id}>
                       <span className="flex items-center gap-2">
                         <span>{p.icon}</span> {p.name}
                       </span>
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-background mt-auto flex gap-3">
          <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="edit-form" className="flex-1 h-12" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
