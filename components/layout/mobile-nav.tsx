// file: components/layout/mobile-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  BarChart3,
  Calendar,
  LayoutDashboard,
  Receipt,
  ArrowRightLeft,
  Settings,
  Utensils,
  WalletCards,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Meals", href: "/meals", icon: Utensils },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* FIXED: Removed asChild and used buttonVariants directly on the trigger */}
      <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "icon" }), "shrink-0 md:hidden")}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent className="flex flex-col" side="left">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <nav className="grid gap-2 text-lg font-medium mt-4">
          <Link 
            href="/dashboard" 
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-lg font-semibold mb-4 px-2"
          >
            <WalletCards className="h-6 w-6 text-primary" />
            <span>Expense Tracker</span>
          </Link>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setOpen(false)}
                className={cn(
                  "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-3 text-sm transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}