"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface UserInfo {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
}

interface LookupsData {
  categories: LookupItem[];
  paymentMethods: LookupItem[];
  people?: LookupItem[];
}

export function DashboardShell({ 
  children, 
  user, 
  lookups 
}: { 
  children: React.ReactNode;
  user: UserInfo;
  lookups: LookupsData;
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar_collapsed", String(newState));
    }
  };

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "grid min-h-screen w-full transition-all duration-300 motion-reduce:transition-none",
          isCollapsed 
            ? "md:grid-cols-[80px_1fr]" 
            : "md:grid-cols-[220px_1fr] lg:grid-cols-[256px_1fr]"
        )}
      >
        <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        <div className="flex flex-col overflow-hidden pb-16 md:pb-0">
          <Header
            user={user}
            categories={lookups.categories}
            paymentMethods={lookups.paymentMethods}
            people={lookups.people}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto bg-muted/10">
            {children}
          </main>
        </div>
        <MobileNav categories={lookups.categories} paymentMethods={lookups.paymentMethods} people={lookups.people} />
        <CommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setIsCommandPaletteOpen}
          categories={lookups.categories}
          paymentMethods={lookups.paymentMethods}
          people={lookups.people}
        />
      </div>
    </TooltipProvider>
  );
}
