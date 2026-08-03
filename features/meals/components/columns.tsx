// file: features/meals/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { meals } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type MealColumnType = InferSelectModel<typeof meals>;

export const columns: ColumnDef<MealColumnType>[] = [
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
    accessorKey: "mealDate",
    header: "Date",
    cell: ({ row }) => <span className="font-medium">{format(new Date(row.original.mealDate), "EEEE, MMM dd, yyyy")}</span>,
  },
  {
    accessorKey: "mealCount",
    header: "Meals Eaten",
    cell: ({ row }) => {
      const count = row.original.mealCount;
      return (
        <Badge variant={count === 2 ? "default" : count === 1 ? "secondary" : "destructive"}>
          {count} {count === 1 ? "Meal" : "Meals"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.notes || "-"}</span>,
  },
];