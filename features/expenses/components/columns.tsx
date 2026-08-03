// file: features/expenses/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import * as Icons from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney } from "@/lib/finance";

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
    header: "Date",
    cell: ({ row }) => <span>{format(new Date(row.original.expenseDate), "MMM dd, yyyy")}</span>,
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.original.category;
      const Icon = iconMap[cat.icon] || Icons.HelpCircle;
      return (
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
            <Icon className="h-4 w-4" />
          </div>
          <span>{cat.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod.name",
    header: "Method",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      return <div className="text-right font-medium">{formatMoney(row.original.amount * 100)}</div>;
    },
  },
];