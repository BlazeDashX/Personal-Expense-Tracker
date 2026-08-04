"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  CalendarDays,
  Receipt,
  ArrowRightLeft,
  UtensilsCrossed,
  PieChart,
  Settings,
  PlusCircle,
  TrendingDown,
  ArrowDownToLine,
  HandCoins,
  Search,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectAction?: (actionType: string) => void;
}

const NAV_COMMANDS = [
  { group: "Navigation", id: "nav-dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { group: "Navigation", id: "nav-activity", name: "Activity", href: "/activity", icon: Activity },
  { group: "Navigation", id: "nav-calendar", name: "Calendar", href: "/calendar", icon: CalendarDays },
  { group: "Navigation", id: "nav-expenses", name: "Expenses", href: "/expenses", icon: Receipt },
  { group: "Navigation", id: "nav-transactions", name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { group: "Navigation", id: "nav-meals", name: "Meals", href: "/meals", icon: UtensilsCrossed },
  { group: "Navigation", id: "nav-reports", name: "Reports", href: "/reports", icon: PieChart },
  { group: "Navigation", id: "nav-settings", name: "Settings", href: "/settings", icon: Settings },
];

const ACTION_COMMANDS = [
  { group: "Quick Actions", id: "action-expense", name: "Add Expense", actionType: "EXPENSE", icon: TrendingDown },
  { group: "Quick Actions", id: "action-income", name: "Add Income", actionType: "CASH_IN", icon: ArrowDownToLine },
  { group: "Quick Actions", id: "action-transfer", name: "Add Transfer", actionType: "TRANSFER", icon: ArrowRightLeft },
  { group: "Quick Actions", id: "action-loan", name: "Add Loan / Borrow", actionType: "LOAN_GIVEN", icon: HandCoins },
  { group: "Quick Actions", id: "action-refund", name: "Add Refund / Return", actionType: "RETURNED", icon: PlusCircle },
];

export function CommandPalette({ open: externalOpen, onOpenChange: externalOnOpenChange, onSelectAction }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (externalOnOpenChange) {
        externalOnOpenChange(value);
      }
      if (!isControlled) {
        setInternalOpen(value);
      }
      if (!value) {
        setSearch("");
        setSelectedIndex(0);
      }
    },
    [externalOnOpenChange, isControlled]
  );

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  // Filter commands
  const allCommands = React.useMemo(() => [...NAV_COMMANDS, ...ACTION_COMMANDS], []);
  const filteredCommands = React.useMemo(() => {
    if (!search.trim()) return allCommands;
    const query = search.toLowerCase().trim();
    return allCommands.filter(
      (cmd) => cmd.name.toLowerCase().includes(query) || cmd.group.toLowerCase().includes(query)
    );
  }, [allCommands, search]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = React.useCallback(
    (item: typeof allCommands[number]) => {
      setOpen(false);
      if ("href" in item && item.href) {
        router.push(item.href);
      } else if ("actionType" in item && item.actionType && onSelectAction) {
        onSelectAction(item.actionType);
      }
    },
    [router, setOpen, onSelectAction]
  );

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border bg-popover shadow-2xl">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search navigation pages and quick actions.
        </DialogDescription>

        {/* Input Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search page... (e.g. Expenses, Add Income)"
            className="border-none shadow-none focus-visible:ring-0 text-base h-9 bg-transparent p-0"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
            <span>ESC</span>
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No results found for &quot;{search}&quot;.
            </div>
          ) : (
            <div className="space-y-3">
              {["Navigation", "Quick Actions"].map((groupName) => {
                const groupItems = filteredCommands.filter((cmd) => cmd.group === groupName);
                if (groupItems.length === 0) return null;

                return (
                  <div key={groupName} className="space-y-1">
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {groupName}
                    </div>
                    {groupItems.map((cmd) => {
                      const overallIndex = filteredCommands.findIndex((item) => item.id === cmd.id);
                      const isSelected = overallIndex === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <button
                          key={cmd.id}
                          type="button"
                          onClick={() => handleSelect(cmd)}
                          onMouseEnter={() => setSelectedIndex(overallIndex)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left outline-none",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                            <span>{cmd.name}</span>
                          </div>
                          {"href" in cmd && (
                            <span className={cn("text-xs font-mono opacity-60", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                              {cmd.href}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
