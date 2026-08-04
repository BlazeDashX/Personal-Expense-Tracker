"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
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

  // Optional: save to local storage
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
    <div 
      className={cn(
        "grid min-h-screen w-full transition-all duration-300",
        isCollapsed 
          ? "md:grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr]" 
          : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
      )}
    >
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <div className="flex flex-col overflow-hidden pb-16 md:pb-0">
        <Header user={user} categories={lookups.categories} paymentMethods={lookups.paymentMethods} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto bg-muted/10">
          {children}
        </main>
      </div>
      <MobileNav categories={lookups.categories} paymentMethods={lookups.paymentMethods} />
    </div>
  );
}
