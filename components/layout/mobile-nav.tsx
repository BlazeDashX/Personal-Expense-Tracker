"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalAddMenu } from "@/components/layout/global-add-menu";
import type { Category, PaymentMethod } from "@/features/settings/components/settings-panels";

interface MobileNavProps {
  categories: Category[];
  paymentMethods: PaymentMethod[];
}

export function MobileNav({ categories, paymentMethods }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
      <nav className="flex items-center justify-around h-16">
        <Link
          href="/dashboard"
          className={cn("flex flex-col items-center justify-center w-full h-full gap-1", pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground")}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          href="/activity"
          className={cn("flex flex-col items-center justify-center w-full h-full gap-1", pathname.startsWith("/activity") ? "text-primary" : "text-muted-foreground")}
        >
          <Activity className="h-5 w-5" />
          <span className="text-[10px] font-medium">Activity</span>
        </Link>

        {/* Central Add Button */}
        <div className="flex w-full h-full justify-center items-center -translate-y-4">
           <GlobalAddMenu categories={categories} paymentMethods={paymentMethods} />
        </div>

        <Link
          href="/reports"
          className={cn("flex flex-col items-center justify-center w-full h-full gap-1", pathname.startsWith("/reports") ? "text-primary" : "text-muted-foreground")}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Reports</span>
        </Link>
        <Link
          href="/settings"
          className={cn("flex flex-col items-center justify-center w-full h-full gap-1", pathname.startsWith("/settings") ? "text-primary" : "text-muted-foreground")}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </nav>
    </div>
  );
}