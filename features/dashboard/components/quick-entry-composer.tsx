"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { submitQuickEntry } from "../actions/quick-entry";
import { formatMoney } from "@/lib/finance";
import type { Category, PaymentMethod } from "@/features/settings/components/settings-panels";

interface QuickEntryComposerProps {
  categories: Category[];
  paymentMethods: PaymentMethod[];
}

export function QuickEntryComposer({ categories, paymentMethods }: QuickEntryComposerProps) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K to focus
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const parseInput = (text: string) => {
    const words = text.trim().split(" ");
    if (words.length === 0) return null;

    // 1. Amount (first number found)
    const amountMatch = text.match(/\b\d+(\.\d+)?\b/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : null;
    
    if (!amount) return null; // Can't submit without amount

    // 2. Date (simple check for yesterday)
    const date = new Date();
    if (text.toLowerCase().includes("yesterday")) {
      date.setDate(date.getDate() - 1);
    }

    // 3. Type
    let type = "EXPENSE";
    if (/\b(salary|income|freelance|received|cash in)\b/i.test(text)) {
      type = "CASH_IN";
    }

    // 4. Category
    let categoryId = categories[0]?.id; // default to first category
    // Try to match keywords in category names
    for (const cat of categories) {
      if (text.toLowerCase().includes(cat.name.toLowerCase())) {
        categoryId = cat.id;
        break;
      }
    }
    // Also try to match typical food words to a "Food" category if present
    if (/\b(lunch|dinner|breakfast|food|coffee|snack|meal)\b/i.test(text)) {
      const foodCat = categories.find(c => c.name.toLowerCase().includes("food") || c.name.toLowerCase().includes("meal"));
      if (foodCat) categoryId = foodCat.id;
    }

    // 5. Payment Method
    let paymentMethodId = paymentMethods[0]?.id;
    for (const pm of paymentMethods) {
      if (text.toLowerCase().includes(pm.name.toLowerCase())) {
        paymentMethodId = pm.id;
        break;
      }
    }

    // 6. Description (remove amount, yesterday, today, and matched category/pm)
    let description = text.replace(amountMatch![0], "");
    description = description.replace(/\b(yesterday|today)\b/ig, "");
    if (categoryId) {
      const cat = categories.find(c => c.id === categoryId);
      if (cat) description = description.replace(new RegExp(`\\b${cat.name}\\b`, "ig"), "");
    }
    if (paymentMethodId) {
      const pm = paymentMethods.find(p => p.id === paymentMethodId);
      if (pm) description = description.replace(new RegExp(`\\b${pm.name}\\b`, "ig"), "");
    }
    
    description = description.trim().replace(/\s+/g, " ");
    
    // Capitalize first letter
    if (description) {
      description = description.charAt(0).toUpperCase() + description.slice(1);
    } else {
      description = type === "EXPENSE" ? "Expense" : "Income";
    }

    return { amount, description, type, categoryId, paymentMethodId, date };
  };

  const parsed = parseInput(input);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed) return;

    try {
      setIsSubmitting(true);
      await submitQuickEntry(parsed);
      
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Added {parsed.type === "EXPENSE" ? "Expense" : "Income"}</span>
          <span className="text-sm text-muted-foreground">{parsed.description} • {formatMoney(parsed.amount * 100)}</span>
        </div>
      );
      
      setInput("");
      // Keep focus for rapid entry
      inputRef.current?.focus();
    } catch {
      toast.error("Failed to add entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What did you spend or receive? (e.g. Lunch 250 cash)"
          className="h-14 pl-4 pr-16 text-lg rounded-2xl shadow-sm border-muted-foreground/20 bg-background font-mono tabular-nums"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!parsed || isSubmitting}
          className="absolute right-2 h-10 w-10 rounded-xl"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
        </Button>
      </form>
      
      <div className="h-6 px-2 flex items-center justify-between text-xs text-muted-foreground transition-opacity duration-200">
        {parsed ? (
          <div className="flex gap-2 items-center">
            <span className="font-medium text-foreground">{parsed.description}</span>
            <span>•</span>
            <span className={`font-mono tabular-nums ${parsed.type === "EXPENSE" ? "text-destructive" : "text-emerald-500"}`}>
              {parsed.type === "EXPENSE" ? "-" : "+"}{formatMoney(parsed.amount * 100)}
            </span>
            <span>•</span>
            <span>{categories.find(c => c.id === parsed.categoryId)?.name || "No Category"}</span>
            <span>•</span>
            <span>{paymentMethods.find(p => p.id === parsed.paymentMethodId)?.name || "No PM"}</span>
            <span>•</span>
            <span>{parsed.date.toLocaleDateString()}</span>
          </div>
        ) : (
          <div className="flex gap-4">
            <span className="hidden sm:inline">Try: <span className="font-medium text-foreground">Coffee 180 bKash</span></span>
            <span className="hidden sm:inline">Try: <span className="font-medium text-foreground">Salary 30000 bank</span></span>
            <span className="inline sm:hidden">Press <kbd className="font-sans px-1 rounded bg-muted border">Enter</kbd> to save</span>
            <span className="hidden md:inline">Press <kbd className="font-sans px-1 rounded bg-muted border">Ctrl</kbd> + <kbd className="font-sans px-1 rounded bg-muted border">K</kbd> to focus</span>
          </div>
        )}
      </div>
    </div>
  );
}
