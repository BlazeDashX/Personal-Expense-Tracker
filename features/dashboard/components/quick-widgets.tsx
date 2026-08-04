"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { submitQuickEntry } from "../actions/quick-entry";
import { toast } from "sonner";
import { formatMoney } from "@/lib/finance";

interface Shortcut {
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

import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function QuickWidgetGrid({ shortcuts, type }: { shortcuts: Shortcut[], type: "EXPENSE" | "TRANSACTION" }) {
  const items = shortcuts.filter(s => s.type === type);
  
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(item => (
        <QuickWidgetItem key={item.id} shortcut={item} />
      ))}
    </div>
  );
}

function QuickWidgetItem({ shortcut }: { shortcut: Shortcut }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [amountStr, setAmountStr] = useState((shortcut.amount / 100).toString());
  
  const IconComp = (Icons as unknown as Record<string, React.ElementType>)[shortcut.icon] || Icons.Circle;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      setIsSubmitting(true);
      
      const payload = {
        amount: parsedAmount,
        description: shortcut.title,
        type: shortcut.transactionType || "EXPENSE",
        categoryId: shortcut.categoryId || undefined,
        paymentMethodId: shortcut.paymentMethodId,
        date: new Date()
      };
      
      await submitQuickEntry(payload);
      
      toast.success(
        <div className="flex justify-between items-center w-full">
          <div>
            <span className="font-semibold text-sm block">Added {shortcut.title}</span>
            <span className="text-xs text-muted-foreground">{formatMoney(parsedAmount * 100)}</span>
          </div>
          <button className="text-sm font-medium text-primary hover:underline px-2 py-1">Undo</button>
        </div>
      );
      setIsOpen(false);
    } catch {
      toast.error("Failed to add " + shortcut.title);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) setAmountStr((shortcut.amount / 100).toString());
    }}>
      <PopoverTrigger className={`flex flex-col gap-3 p-4 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all active:scale-95 text-left ${isSubmitting ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between w-full">
          <div className="p-2.5 bg-muted rounded-full">
            <IconComp className="h-5 w-5 text-foreground" />
          </div>
          <span className="text-xs font-semibold font-mono tabular-nums px-2 py-1 bg-muted rounded-full text-muted-foreground">
            {formatMoney(shortcut.amount)}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-sm leading-tight">{shortcut.title}</h4>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-56 p-3" sideOffset={8}>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
           <div className="relative flex-1">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">৳</span>
             <Input 
               type="number" 
               step="0.01"
               autoFocus
               value={amountStr} 
               onChange={(e) => setAmountStr(e.target.value)} 
               className="pl-7 h-10 font-semibold font-mono tabular-nums"
               disabled={isSubmitting}
             />
           </div>
           <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
             <Check className="h-5 w-5" />
           </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
