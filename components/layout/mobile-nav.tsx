"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  PieChart,
  Menu,
  CalendarDays,
  Receipt,
  ArrowRightLeft,
  UtensilsCrossed,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalAddMenu } from "@/components/layout/global-add-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
interface LookupItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface MobileNavProps {
  categories: LookupItem[];
  paymentMethods: LookupItem[];
  people?: LookupItem[];
}

const MORE_NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { name: "Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Ledger",
    items: [
      { name: "Expenses", href: "/expenses", icon: Receipt },
      { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
      { name: "Meals", href: "/meals", icon: UtensilsCrossed },
    ],
  },
  {
    label: "Preferences",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function MobileNav({ categories, paymentMethods, people = [] }: MobileNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isMoreActive = MORE_NAV_GROUPS.some((g) =>
    g.items.some((i) => pathname.startsWith(i.href))
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md pb-safe">
      <nav className="flex items-center justify-around h-16 px-2">
        {/* 1. Home */}
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
            pathname.startsWith("/dashboard") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* 2. Activity */}
        <Link
          href="/activity"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
            pathname.startsWith("/activity") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Activity className="h-5 w-5" />
          <span className="text-[10px] font-medium">Activity</span>
        </Link>

        {/* 3. Central Add Button */}
        <div className="flex w-full h-full justify-center items-center -translate-y-4">
          <GlobalAddMenu categories={categories} paymentMethods={paymentMethods} people={people} />
        </div>

        {/* 4. Reports */}
        <Link
          href="/reports"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
            pathname.startsWith("/reports") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PieChart className="h-5 w-5" />
          <span className="text-[10px] font-medium">Reports</span>
        </Link>

        {/* 5. More Drawer Trigger */}
        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
              isMoreActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl border-t bg-popover max-h-[85vh] overflow-y-auto px-6 py-6">
            <SheetHeader className="text-left pb-4 border-b">
              <SheetTitle className="text-lg font-bold">Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 pt-4">
              {MORE_NAV_GROUPS.map((group) => (
                <div key={group.label} className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const isActive = pathname.startsWith(item.href);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-2xl border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive
                              ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                              : "bg-card text-foreground hover:bg-muted/70"
                          )}
                        >
                          <div className={cn("p-2 rounded-xl border shrink-0", isActive ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}