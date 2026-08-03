// file: features/transactions/components/data-table.tsx
"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Plus, Download, Trash, Copy, Pencil } from "lucide-react";
import { toast } from "sonner";
import * as xlsx from "xlsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { deleteTransaction, duplicateTransaction, bulkDeleteTransactions } from "../actions/transaction-actions";
import { cn } from "@/lib/utils";
import type { PaymentMethod, Person } from "@/features/settings/components/settings-panels";
import type { TransactionColumnType } from "./columns";

interface DataTableProps {
  columns: ColumnDef<TransactionColumnType>[];
  data: TransactionColumnType[];
  paymentMethods: PaymentMethod[];
  people: Person[];
}

export function DataTable({ columns, data, paymentMethods, people }: DataTableProps) {
  "use no memo";
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<TransactionColumnType | null>(null);

  const tableColumns = useMemo<ColumnDef<TransactionColumnType>[]>(() => [
    ...columns,
    {
      id: "actions",
      cell: ({ row }: { row: Row<TransactionColumnType> }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8 p-0")}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => { setEditingData(row.original); setIsDialogOpen(true); }}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {
              const res = await duplicateTransaction(row.original.id);
              if (res.error) toast.error(res.error);
              else toast.success("Transaction duplicated!");
            }}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={async () => {
              if (confirm("Delete this transaction?")) {
                const res = await deleteTransaction(row.original.id);
                if (res.error) toast.error(res.error);
                else toast.success("Transaction deleted.");
              }
            }}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [columns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: { rowSelection, globalFilter },
    globalFilterFn: "includesString",
  });

  const handleExport = (type: "csv" | "xlsx") => {
    const filteredData = table.getFilteredRowModel().rows.map(row => {
      const r = row.original;
      return {
        Date: new Date(r.transactionDate).toISOString().slice(0, 10),
        Type: r.type,
        Account: r.paymentMethod.name,
        "Destination/Person": r.destinationPaymentMethod?.name || r.person?.name || "",
        Amount: r.amount,
        Notes: r.notes || "",
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(filteredData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");
    xlsx.writeFile(workbook, `transactions-${new Date().toISOString().slice(0, 10)}.${type}`);
    toast.success(`Exported as ${type.toUpperCase()}`);
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedRows.length} transactions?`)) {
      const ids = selectedRows.map((row) => row.original.id);
      const res = await bulkDeleteTransactions(ids);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Transactions deleted.");
        setRowSelection({});
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Input
          placeholder="Search transactions..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="mr-2 h-4 w-4" /> Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }))}>
              <Download className="mr-2 h-4 w-4" /> Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => { setEditingData(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">No transactions found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingData ? "Edit Transaction" : "New Transaction"}</DialogTitle></DialogHeader>
          <TransactionForm
            initialData={editingData}
            paymentMethods={paymentMethods}
            people={people}
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}