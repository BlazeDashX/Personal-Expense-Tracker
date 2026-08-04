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
  Loader2,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toMinorUnits, formatMoney } from "@/lib/finance";
import { searchCommandPalette, type SearchResults } from "@/features/search/actions/search-actions";
import { EditActivitySheet } from "@/features/forms/components/edit-activity-sheet";
import type { UnifiedActivity } from "@/features/activity/queries/get-activity";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectAction?: (actionType: string) => void;
  categories?: LookupItem[];
  paymentMethods?: LookupItem[];
  people?: LookupItem[];
}

const NAV_COMMANDS = [
  { group: "Navigation", id: "nav-dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { group: "Navigation", id: "nav-activity", name: "Activity", href: "/activity", icon: Activity },
  { group: "Navigation", id: "nav-calendar", name: "Calendar", href: "/calendar", icon: CalendarDays },
  { group: "Navigation", id: "nav-expenses", name: "Expenses", href: "/expenses", icon: Receipt },
  { group: "Navigation", id: "nav-transactions", name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { group: "Navigation", id: "nav-people", name: "People & Debts", href: "/people", icon: HandCoins },
  { group: "Navigation", id: "nav-meals", name: "Meals", href: "/meals", icon: UtensilsCrossed },
  { group: "Navigation", id: "nav-reports", name: "Reports", href: "/reports", icon: PieChart },
  { group: "Navigation", id: "nav-budgets", name: "Budgets", href: "/budgets", icon: PlusCircle },
  { group: "Navigation", id: "nav-settings", name: "Settings", href: "/settings", icon: Settings },
];

const ACTION_COMMANDS = [
  { group: "Quick Actions", id: "action-expense", name: "Add Expense", actionType: "EXPENSE", icon: TrendingDown },
  { group: "Quick Actions", id: "action-income", name: "Add Income", actionType: "CASH_IN", icon: ArrowDownToLine },
  { group: "Quick Actions", id: "action-transfer", name: "Add Transfer", actionType: "TRANSFER", icon: ArrowRightLeft },
  { group: "Quick Actions", id: "action-loan", name: "Add Loan / Borrow", actionType: "LOAN_GIVEN", icon: HandCoins },
  { group: "Quick Actions", id: "action-refund", name: "Add Refund / Return", actionType: "RETURNED", icon: PlusCircle },
];

type RenderableItem =
  | { kind: "nav"; id: string; name: string; href: string; group: string; icon: React.ComponentType<{ className?: string }> }
  | { kind: "action"; id: string; name: string; actionType: string; group: string; icon: React.ComponentType<{ className?: string }> }
  | { kind: "expense"; id: string; group: "Expenses"; activity: UnifiedActivity }
  | { kind: "transaction"; id: string; group: "Transactions"; activity: UnifiedActivity }
  | { kind: "person"; id: string; group: "People"; person: { id: string; name: string; phone?: string | null } }
  | { kind: "ledgerLink"; id: string; group: string; label: string; href: string };

export function CommandPalette({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSelectAction,
  categories = [],
  paymentMethods = [],
  people = [],
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [isSearching, startTransition] = React.useTransition();
  const [searchResults, setSearchResults] = React.useState<SearchResults | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [editingActivity, setEditingActivity] = React.useState<UnifiedActivity | null>(null);

  const router = useRouter();
  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (externalOnOpenChange) externalOnOpenChange(value);
      if (!isControlled) setInternalOpen(value);
      if (!value) {
        setSearch("");
        setDebouncedSearch("");
        setSearchResults(null);
        setSelectedIndex(0);
      }
    },
    [externalOnOpenChange, isControlled]
  );

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Execute server search when debounced search changes
  React.useEffect(() => {
    const query = debouncedSearch.trim();
    if (!query) return;

    let isSubscribed = true;
    startTransition(async () => {
      try {
        const res = await searchCommandPalette(query);
        if (isSubscribed) setSearchResults(res);
      } catch {
        // ignore
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [debouncedSearch]);

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

  // Active search results derived from current search query
  const activeSearchResults = search.trim() ? searchResults : null;

  // Construct flat linear item list for keyboard navigation
  const renderableItems = React.useMemo<RenderableItem[]>(() => {
    const items: RenderableItem[] = [];
    const query = search.toLowerCase().trim();

    // 1. Filtered Nav & Actions
    const navs = NAV_COMMANDS.filter((c) => !query || c.name.toLowerCase().includes(query)).map(
      (c) => ({ kind: "nav" as const, ...c })
    );
    const actions = ACTION_COMMANDS.filter((c) => !query || c.name.toLowerCase().includes(query)).map(
      (c) => ({ kind: "action" as const, ...c })
    );

    items.push(...navs, ...actions);

    // 2. Search Results
    if (activeSearchResults) {
      if (activeSearchResults.expenses.length > 0) {
        activeSearchResults.expenses.forEach((exp) => {
          items.push({ kind: "expense", id: `exp-${exp.id}`, group: "Expenses", activity: exp });
        });
        items.push({
          kind: "ledgerLink",
          id: "link-expenses",
          group: "Expenses",
          label: `See all matching Expenses for "${search}"`,
          href: `/expenses?search=${encodeURIComponent(search)}`,
        });
      }

      if (activeSearchResults.transactions.length > 0) {
        activeSearchResults.transactions.forEach((tx) => {
          items.push({ kind: "transaction", id: `tx-${tx.id}`, group: "Transactions", activity: tx });
        });
        items.push({
          kind: "ledgerLink",
          id: "link-transactions",
          group: "Transactions",
          label: `See all matching Transactions for "${search}"`,
          href: `/transactions?search=${encodeURIComponent(search)}`,
        });
      }

      if (activeSearchResults.people.length > 0) {
        activeSearchResults.people.forEach((p) => {
          items.push({ kind: "person", id: `person-${p.id}`, group: "People", person: p });
        });
      }
    }

    return items;
  }, [search, activeSearchResults]);

  const handleSelect = React.useCallback(
    (item: RenderableItem) => {
      setOpen(false);

      if (item.kind === "nav") {
        router.push(item.href);
      } else if (item.kind === "action") {
        if (onSelectAction) onSelectAction(item.actionType);
      } else if (item.kind === "expense" || item.kind === "transaction") {
        setEditingActivity(item.activity);
      } else if (item.kind === "person") {
        router.push("/people");
      } else if (item.kind === "ledgerLink") {
        router.push(item.href);
      }
    },
    [router, setOpen, onSelectAction]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (renderableItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % renderableItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + renderableItems.length) % renderableItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = renderableItems[selectedIndex];
      if (selected) handleSelect(selected);
    }
  };

  const hasNoMatches =
    search.trim().length > 0 &&
    !isSearching &&
    renderableItems.length === 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border bg-popover shadow-2xl">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search expenses, transactions, people, pages, and quick actions.
          </DialogDescription>

          {/* Input Header */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            {isSearching ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type to search expenses, transactions, people or pages..."
              className="border-none shadow-none focus-visible:ring-0 text-base h-9 bg-transparent p-0"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              <span>ESC</span>
            </kbd>
          </div>

          {/* Screen Reader Live Region */}
          <div className="sr-only" aria-live="polite">
            {renderableItems.length} results found for {search}
          </div>

          {/* Command List */}
          <div className="max-h-96 overflow-y-auto p-2">
            {hasNoMatches ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No matches found for &quot;<strong className="text-foreground">{search}</strong>&quot;.
              </div>
            ) : (
              <div className="space-y-3">
                {["Navigation", "Quick Actions", "Expenses", "Transactions", "People"].map((groupName) => {
                  const groupItems = renderableItems.filter((item) => {
                    if (item.kind === "nav") return item.group === groupName;
                    if (item.kind === "action") return item.group === groupName;
                    return item.group === groupName;
                  });

                  if (groupItems.length === 0) return null;

                  return (
                    <div key={groupName} className="space-y-1">
                      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        {groupName}
                      </div>

                      {groupItems.map((item) => {
                        const overallIndex = renderableItems.findIndex((it) => it.id === item.id);
                        const isSelected = overallIndex === selectedIndex;

                        if (item.kind === "nav") {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(overallIndex)}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left outline-none",
                                isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                                <span>{item.name}</span>
                              </div>
                              <span className={cn("text-xs font-mono opacity-60", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                                {item.href}
                              </span>
                            </button>
                          );
                        }

                        if (item.kind === "action") {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(overallIndex)}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left outline-none",
                                isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                                <span>{item.name}</span>
                              </div>
                            </button>
                          );
                        }

                        if (item.kind === "expense" || item.kind === "transaction") {
                          const act = item.activity;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(overallIndex)}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left outline-none",
                                isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={cn(
                                    "p-1.5 rounded-lg shrink-0 flex items-center justify-center text-xs",
                                    isSelected
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : act.isPositive
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : "bg-rose-500/10 text-rose-500"
                                  )}
                                >
                                  {act.isPositive ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold truncate leading-tight">{act.description}</p>
                                  <p className={cn("text-[10px] truncate opacity-70", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                                    {act.category?.name || act.type} • {format(new Date(act.date), "MMM d")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <span className="font-mono text-xs font-bold tabular-nums">
                                  {formatMoney(toMinorUnits(act.amount))}
                                </span>
                              </div>
                            </button>
                          );
                        }

                        if (item.kind === "person") {
                          const p = item.person;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(overallIndex)}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left outline-none",
                                isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("p-1.5 rounded-lg shrink-0", isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-indigo-500/10 text-indigo-500")}>
                                  <User className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold block">{p.name}</span>
                                  {p.phone && (
                                    <span className={cn("text-[10px] font-mono opacity-70", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                                      {p.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        }

                        if (item.kind === "ledgerLink") {
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(overallIndex)}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left outline-none text-primary",
                                isSelected ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                              )}
                            >
                              <span>{item.label}</span>
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            </button>
                          );
                        }

                        return null;
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Sheet when a search expense/transaction is clicked */}
      <EditActivitySheet
        activity={editingActivity}
        open={!!editingActivity}
        onOpenChange={(open) => {
          if (!open) setEditingActivity(null);
        }}
        categories={categories}
        paymentMethods={paymentMethods}
        people={people}
      />
    </>
  );
}
