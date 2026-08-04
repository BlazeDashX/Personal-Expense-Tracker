// file: components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Activity,
  WalletCards,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("hidden border-r bg-muted/40 md:block relative transition-all duration-300", isCollapsed ? "w-20" : "w-56 lg:w-72")}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className={cn("flex h-14 items-center border-b px-4 lg:h-15", isCollapsed ? "justify-center px-0" : "lg:px-6")}>
          <Link className={cn("flex items-center gap-2 font-semibold", isCollapsed && "justify-center")} href="/dashboard">
            <WalletCards className="h-6 w-6 text-primary shrink-0" />
            {!isCollapsed && <span>Expense Tracker</span>}
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className={cn("grid items-start px-2 text-sm font-medium", isCollapsed ? "px-2 gap-2" : "lg:px-4")}>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg py-2.5 transition-all",
                    isCollapsed ? "justify-center px-0" : "px-3",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-primary"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isCollapsed && "h-5 w-5")} />
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Toggle Button at the bottom */}
        <div className="p-4 border-t mt-auto">
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={onToggle}
             className="w-full flex justify-center text-muted-foreground hover:bg-muted"
           >
             {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
           </Button>
        </div>
      </div>
    </div>
  );
}