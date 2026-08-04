"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function DashboardShell({ 
  children, 
  user, 
  lookups 
}: { 
  children: React.ReactNode;
  user: any;
  lookups: any;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Restore sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", String(newState));
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
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto bg-muted/10">
            {children}
          </main>
        </div>
        <MobileNav categories={lookups.categories} paymentMethods={lookups.paymentMethods} />
        <CommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setIsCommandPaletteOpen}
        />
      </div>
    </TooltipProvider>
  );
}
