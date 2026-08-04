"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import * as Icons from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Amount } from "@/components/shared/amount";
import { toMinorUnits } from "@/lib/finance";

type IconComponent = React.ComponentType<{ className?: string }>;
const iconMap = Icons as unknown as Record<string, IconComponent>;

export type ExpenseColumnType = {
  id: string;
  expenseDate: Date;
  amount: number;
  description: string;
  category: { name: string; icon: string; color: string };
  paymentMethod: { name: string; icon: string; color: string };
};

export const columns: ColumnDef<ExpenseColumnType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "expenseDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-3 h-8 text-xs font-bold"
      >
        Date
        <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-xs font-medium text-muted-foreground">{format(new Date(row.original.expenseDate), "MMM dd, yyyy")}</span>,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-3 h-8 text-xs font-bold"
      >
        Description
        <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-semibold text-sm text-foreground">{row.original.description}</span>,
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.original.category;
      const Icon = iconMap[cat.icon] || Icons.Tag;
      return (
        <div className="flex items-center gap-2">
          <div
            className="p-1 rounded-lg shrink-0 flex items-center justify-center"
            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="text-xs font-medium">{cat.name}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod.name",
    header: "Method",
    cell: ({ row }) => <span className="text-xs text-muted-foreground font-medium">{row.original.paymentMethod.name}</span>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-mr-3 h-8 text-xs font-bold"
        >
          Amount
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <Amount amount={toMinorUnits(row.original.amount)} sign="negative" className="font-mono tabular-nums font-bold" />
        </div>
      );
    },
  },
];