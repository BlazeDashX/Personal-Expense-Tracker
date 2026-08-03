// file: features/transactions/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/finance";
import { ArrowRight } from "lucide-react";
import type { PaymentMethod, Person } from "@/features/settings/components/settings-panels";

export type TransactionColumnType = {
  id: string;
  transactionDate: Date;
  type: "CASH_IN" | "CASH_OUT" | "LOAN_GIVEN" | "LOAN_RECEIVED" | "BORROWED" | "RETURNED" | "TRANSFER";
  amount: number;
  notes?: string | null;
  paymentMethod: PaymentMethod;
  destinationPaymentMethod?: PaymentMethod | null;
  person?: Person | null;
};

export const columns: ColumnDef<TransactionColumnType>[] = [
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
    accessorKey: "transactionDate",
    header: "Date",
    cell: ({ row }) => <span>{format(new Date(row.original.transactionDate), "MMM dd, yyyy")}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const getVariant = (t: string) => {
        if (["CASH_IN", "LOAN_RECEIVED", "BORROWED"].includes(t)) return "default";
        if (["CASH_OUT", "LOAN_GIVEN", "RETURNED"].includes(t)) return "destructive";
        return "secondary";
      };
      return <Badge variant={getVariant(type)}>{type.replace("_", " ")}</Badge>;
    },
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) => {
      const { type, paymentMethod, destinationPaymentMethod, person } = row.original;
      if (type === "TRANSFER") {
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {paymentMethod.name} <ArrowRight className="h-3 w-3" /> {destinationPaymentMethod?.name}
          </div>
        );
      }
      if (person) {
        return <span className="text-sm text-muted-foreground">With: {person.name}</span>;
      }
      return <span className="text-sm text-muted-foreground">Account: {paymentMethod.name}</span>;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const type = row.original.type;
      const amount = row.original.amount;
      const isNegative = ["CASH_OUT", "LOAN_GIVEN", "RETURNED"].includes(type);
      return (
        <div className={`text-right font-medium ${isNegative ? "text-destructive" : ""}`}>
          {isNegative ? "-" : ""}{formatMoney(amount * 100)}
        </div>
      );
    },
  },
];