"use client";

import { GlobalAddMenu } from "./global-add-menu";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
}

interface FloatingQuickDockProps {
  categories?: LookupItem[];
  paymentMethods?: LookupItem[];
}

export function FloatingQuickDock({ categories = [], paymentMethods = [] }: FloatingQuickDockProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <div className="shadow-2xl rounded-full bg-primary text-primary-foreground p-1 hover:scale-105 transition-all duration-300 active:scale-95">
        <GlobalAddMenu categories={categories} paymentMethods={paymentMethods} />
      </div>
    </div>
  );
}
