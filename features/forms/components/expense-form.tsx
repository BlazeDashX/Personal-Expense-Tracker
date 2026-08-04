"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitQuickEntry } from "../../dashboard/actions/quick-entry";
import { toast } from "sonner";
import { formatMoney } from "@/lib/finance";

export function ExpenseForm({ 
  onCancel,
  categories = [],
  paymentMethods = []
}: { 
  onCancel: () => void;
  categories?: any[];
  paymentMethods?: any[];
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      setIsSubmitting(true);
      await submitQuickEntry({
        amount: parsedAmount,
        description,
        type: "EXPENSE",
        categoryId,
        paymentMethodId,
        date: new Date()
      });
      
      toast.success(
        <div className="flex justify-between items-center w-full">
          <div>
            <span className="font-semibold text-sm block">Saved Expense</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
          <span className="font-medium text-destructive">{formatMoney(parsedAmount * 100)}</span>
        </div>
      );
      
      onCancel(); // Close form
    } catch (err) {
      toast.error("Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">৳</span>
          <Input 
            id="amount" 
            type="number" 
            step="0.01"
            placeholder="0.00" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            autoFocus 
            required 
            disabled={isSubmitting}
            className="text-2xl font-semibold h-14 pl-8"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="desc">Description</Label>
        <Input 
          id="desc" 
          placeholder="What was this for?" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          required 
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-2">
           <Label>Category</Label>
           <Select value={categoryId} onValueChange={setCategoryId} disabled={isSubmitting} required>
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
        <div className="flex flex-col gap-2">
           <Label>Payment Method</Label>
           <Select value={paymentMethodId} onValueChange={setPaymentMethodId} disabled={isSubmitting} required>
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
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="button" variant="outline" className="flex-1 h-12" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" className="flex-1 h-12" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Expense"}
        </Button>
      </div>
    </form>
  );
}
