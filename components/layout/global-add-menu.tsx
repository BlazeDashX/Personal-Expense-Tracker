
"use client";

import { useState } from "react";
import { Plus, Receipt, ArrowDownToLine, ArrowRightLeft, Landmark, Undo2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/features/forms/components/expense-form";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
}

export function GlobalAddMenu({ categories = [], paymentMethods = [] }: { categories?: LookupItem[], paymentMethods?: LookupItem[] }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "expense" | "income" | "transfer" | "loan" | "refund">("menu");

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) setTimeout(() => setView("menu"), 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap h-14 w-14 md:h-10 md:w-10 rounded-full shadow-lg border-4 border-background md:border-none md:shadow-none bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-105 active:scale-95">
        <Plus className="h-7 w-7 md:h-5 md:w-5" />
        <span className="sr-only">Add New</span>
      </SheetTrigger>
      {/* On desktop we make it a centered modal, on mobile a bottom sheet */}
      <SheetContent side="bottom" className="rounded-t-2xl min-h-[50vh] sm:min-h-0 sm:max-h-[85vh] sm:h-auto sm:max-w-md sm:mx-auto sm:rounded-2xl sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%] pb-safe">
        <SheetHeader className="mb-6 mt-2">
           <SheetTitle className="text-center">{view === "menu" ? "Add New" : view.charAt(0).toUpperCase() + view.slice(1)}</SheetTitle>
        </SheetHeader>
        
        {view === "menu" && (
          <div className="grid grid-cols-2 gap-3 px-2">
            <MenuAction icon={<Receipt className="h-6 w-6 text-rose-500" />} label="Expense" onClick={() => setView("expense")} />
            <MenuAction icon={<ArrowDownToLine className="h-6 w-6 text-emerald-500" />} label="Income" onClick={() => setView("income")} />
            <MenuAction icon={<ArrowRightLeft className="h-6 w-6 text-indigo-500" />} label="Transfer" onClick={() => setView("transfer")} />
            <MenuAction icon={<Landmark className="h-6 w-6 text-amber-500" />} label="Loan" onClick={() => setView("loan")} />
            <MenuAction icon={<Undo2 className="h-6 w-6 text-slate-500" />} label="Refund" onClick={() => setView("refund")} />
          </div>
        )}

        {view !== "menu" && (
          <div className="px-2 pb-6">
             <Button variant="ghost" className="mb-4 -ml-4" onClick={() => setView("menu")}>
               ← Back to Menu
             </Button>
             
             {view === "expense" && <ExpenseForm categories={categories} paymentMethods={paymentMethods} onCancel={() => setView("menu")} />}
             {view !== "expense" && (
               <div className="text-muted-foreground text-center py-12">
                 [ Structured {view} form placeholder ]
               </div>
             )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MenuAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors shadow-sm"
    >
      <div className="p-3 rounded-full bg-muted">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
}
