"use client";

import React, { useMemo, useState } from "react";
import { format, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns";
import * as Icons from "lucide-react";
import { formatMoney } from "@/lib/finance";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Copy } from "lucide-react";
import { EditActivitySheet } from "../../forms/components/edit-activity-sheet";
import { toast } from "sonner";
import { deleteActivity } from "../actions/activity";
import type { UnifiedActivity } from "../queries/get-activity";

interface LookupItem {
  id: string;
  name: string;
  icon?: string;
}

function groupActivity(data: UnifiedActivity[]) {
  const groups: Record<string, UnifiedActivity[]> = {
    "Today": [],
    "Yesterday": [],
    "Earlier this week": [],
    "Earlier this month": [],
    "Older": [],
  };

  data.forEach((item) => {
    const d = new Date(item.date);
    if (isToday(d)) groups["Today"].push(item);
    else if (isYesterday(d)) groups["Yesterday"].push(item);
    else if (isThisWeek(d)) groups["Earlier this week"].push(item);
    else if (isThisYear(d)) groups["Earlier this month"].push(item); // Simple fallback for now
    else groups["Older"].push(item);
  });

  return Object.entries(groups).filter(([key, items]) => items.length > 0);
}

export function ActivityFeed({ 
  data,
  categories = [],
  paymentMethods = [],
  people = [],
}: { 
  data: UnifiedActivity[];
  categories?: LookupItem[];
  paymentMethods?: LookupItem[];
  people?: LookupItem[];
}) {
  const [editingItem, setEditingItem] = useState<UnifiedActivity | null>(null);
  const groupedData = useMemo(() => groupActivity(data), [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-muted-foreground bg-card rounded-xl border border-dashed shadow-sm">
        <Icons.Inbox className="h-10 w-10 mb-2 opacity-20" />
        <p>No activity found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedData.map(([groupName, items]) => (
        <div key={groupName} className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground sticky top-14 bg-muted/10 backdrop-blur py-2 z-10">
            {groupName}
          </h3>
          <div className="bg-card border rounded-xl shadow-sm divide-y">
            {items.map((item) => {
              // Icon handling
              let IconComp: React.ElementType = Icons.Circle;
              let iconColor = "#6b7280";
              let iconBg = "#f3f4f6";

              if (item.category) {
                IconComp = (Icons as unknown as Record<string, React.ElementType>)[item.category.icon] || Icons.Circle;
                iconColor = item.category.color;
                iconBg = item.category.color + "20";
              } else if (item.isPositive) {
                IconComp = Icons.ArrowDownToLine;
                iconColor = "#10b981"; // emerald-500
                iconBg = "#d1fae5"; // emerald-100
              } else if (item.isNeutral) {
                IconComp = Icons.ArrowRightLeft;
                iconColor = "#6366f1"; // indigo-500
                iconBg = "#e0e7ff"; // indigo-100
              }

              return (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-2.5 rounded-full shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5 truncate">
                        {item.category?.name || item.type.replace("_", " ")} • {format(new Date(item.date), "MMM dd")}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center ml-4 gap-3">
                    <div className="text-right">
                      <div className={`font-medium ${item.isPositive ? 'text-emerald-600' : item.isNeutral ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {item.isPositive ? '+' : item.isNeutral ? '' : '-'}
                        {formatMoney(item.amount * 100)}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                        {item.paymentMethod.name}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingItem(item)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Duplicate feature coming soon")}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            toast.promise(
                              deleteActivity(item.id, item.type),
                              {
                                loading: 'Deleting...',
                                success: 'Deleted successfully',
                                error: 'Failed to delete'
                              }
                            );
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      <EditActivitySheet 
        activity={editingItem} 
        open={!!editingItem} 
        onOpenChange={(open) => { if (!open) setEditingItem(null); }}
        categories={categories}
        paymentMethods={paymentMethods}
        people={people}
      />
    </div>
  );
}
