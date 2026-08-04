"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Plus, Download, Trash, Copy, Pencil, Search, Filter, Inbox, X, Calculator, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "./expense-form";
import { downloadDataAsFile } from "../utils/export";
import { deleteExpense, duplicateExpense, bulkDeleteExpenses } from "../actions/expense-actions";
import { Amount } from "@/components/shared/amount";
import { formatMoney, toMinorUnits } from "@/lib/finance";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Category, PaymentMethod } from "@/features/settings/components/settings-panels";
import type { ExpenseColumnType } from "./columns";

interface DataTableProps {
  columns: ColumnDef<ExpenseColumnType>[];
  data: ExpenseColumnType[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
}

export function DataTable({ columns, data, categories, paymentMethods }: DataTableProps) {
  "use no memo";
  const [sorting, setSorting] = useState<SortingState>([{ id: "expenseDate", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<ExpenseColumnType | null>(null);

  // Filtered dataset for category and payment method selects
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (categoryFilter !== "ALL" && item.category.name !== categoryFilter) return false;
      if (paymentFilter !== "ALL" && item.paymentMethod.name !== paymentFilter) return false;
      return true;
    });
  }, [data, categoryFilter, paymentFilter]);

  const tableColumns = useMemo<ColumnDef<ExpenseColumnType>[]>(() => [
    ...columns,
    {
      id: "actions",
      cell: ({ row }: { row: Row<ExpenseColumnType> }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8 p-0")}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuItem onClick={() => { setEditingData(row.original); setIsDialogOpen(true); }}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {
              const res = await duplicateExpense(row.original.id);
              if (res.error) toast.error(res.error);
              else toast.success("Expense duplicated!");
            }}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={async () => {
              if (confirm("Delete this expense?")) {
                const res = await deleteExpense(row.original.id);
                if (res.error) toast.error(res.error);
                else toast.success("Expense deleted.");
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
    data: filteredData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, rowSelection, globalFilter },
    globalFilterFn: "includesString",
  });

  // Calculate summary strip stats from currently displayed/filtered rows
  const activeRows = table.getFilteredRowModel().rows;
  const totalAmount = useMemo(() => {
    return activeRows.reduce((sum, row) => sum + row.original.amount, 0);
  }, [activeRows]);
  const rowCount = activeRows.length;
  const averageAmount = rowCount > 0 ? totalAmount / rowCount : 0;

  const handleExport = (type: "csv" | "xlsx") => {
    const exportData = activeRows.map(row => row.original);
    downloadDataAsFile(exportData, `expenses-ledger-${new Date().toISOString().slice(0, 10)}`, type);
    toast.success(`Exported ${exportData.length} rows as ${type.toUpperCase()}`);
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedRows.length} expenses?`)) {
      const ids = selectedRows.map((row) => row.original.id);
      const res = await bulkDeleteExpenses(ids);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Expenses deleted.");
        setRowSelection({});
      }
    }
  };

  const resetFilters = () => {
    setGlobalFilter("");
    setCategoryFilter("ALL");
    setPaymentFilter("ALL");
  };

  const hasActiveFilters = globalFilter !== "" || categoryFilter !== "ALL" || paymentFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* 1. Summary Strip Above Table */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1 p-4 rounded-2xl border bg-card shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-primary" /> Total Expenses
          </span>
          <div className="text-2xl font-black font-mono tabular-nums text-foreground">
            <Amount amount={toMinorUnits(totalAmount)} sign="negative" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Across {rowCount} entries</span>
        </div>

        <div className="flex flex-col gap-1 p-4 rounded-2xl border bg-card shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="h-3.5 w-3.5 text-emerald-500" /> Average / Expense
          </span>
          <div className="text-2xl font-black font-mono tabular-nums text-foreground">
            <Amount amount={toMinorUnits(averageAmount)} />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Per transaction average</span>
        </div>

        <div className="flex flex-col gap-1 p-4 rounded-2xl border bg-card shadow-xs justify-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Record Ledger</span>
          <div className="text-xl font-bold text-foreground">
            {rowCount} <span className="text-sm font-normal text-muted-foreground">matching rows</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Single source of truth</span>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl border bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          {/* Category Filter Select */}
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "ALL")}>
            <SelectTrigger className="h-10 rounded-xl w-37.5 bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Method Filter Select */}
          <Select value={paymentFilter} onValueChange={(val) => setPaymentFilter(val || "ALL")}>
            <SelectTrigger className="h-10 rounded-xl w-37.5 bg-background">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Methods</SelectItem>
              {paymentMethods.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Action Buttons: Bulk Delete, Export, Add */}
        <div className="flex items-center gap-2 shrink-0">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-10 rounded-xl">
              <Trash className="mr-1.5 h-4 w-4" /> Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10 rounded-xl")}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => { setEditingData(null); setIsDialogOpen(true); }} className="h-10 rounded-xl font-semibold">
            <Plus className="mr-1.5 h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* 3. Table / Card View Handling */}
      {data.length === 0 ? (
        /* Genuinely zero expenses */
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl border border-dashed shadow-xs gap-3 min-h-64">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Inbox className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">No expenses logged yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Log your first expense to build your personal financial ledger.
            </p>
          </div>
          <Button onClick={() => { setEditingData(null); setIsDialogOpen(true); }} className="mt-2 rounded-xl">
            <Plus className="mr-1.5 h-4 w-4" /> Add Expense
          </Button>
        </div>
      ) : activeRows.length === 0 ? (
        /* Filtered to zero expenses */
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl border border-dashed shadow-xs gap-3 min-h-64">
          <div className="p-3 rounded-full bg-muted text-muted-foreground">
            <Search className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">No expenses match your filters</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try adjusting your search description, category, or payment method filter.
            </p>
          </div>
          <Button variant="outline" onClick={resetFilters} className="mt-2 rounded-xl">
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="h-11">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden space-y-3">
            {table.getRowModel().rows.map((row) => {
              const item = row.original;
              return (
                <div key={row.id} className="p-4 rounded-2xl border bg-card shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.category.color }} />
                      <span className="text-xs font-semibold text-muted-foreground">{item.category.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{format(new Date(item.expenseDate), "MMM dd, yyyy")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">{item.description}</h4>
                    <Amount amount={toMinorUnits(item.amount)} sign="negative" className="font-mono tabular-nums font-extrabold text-base" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <span>{item.paymentMethod.name}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingData(item); setIsDialogOpen(true); }} className="h-8 px-2">
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={async () => {
                        if (confirm("Delete this expense?")) {
                          await deleteExpense(item.id);
                          toast.success("Deleted");
                        }
                      }} className="h-8 px-2 text-destructive hover:text-destructive">
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 4. Pagination Footer */}
      {activeRows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
          <div>
            Showing <span className="font-bold text-foreground font-mono tabular-nums">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{" "}
            <span className="font-bold text-foreground font-mono tabular-nums">
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, activeRows.length)}
            </span>{" "}
            of <span className="font-bold text-foreground font-mono tabular-nums">{activeRows.length}</span> rows
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(val) => table.setPageSize(Number(val))}
            >
              <SelectTrigger className="h-8 w-17.5 rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 rounded-lg"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 rounded-lg"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Expense Form Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingData ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            initialData={editingData}
            categories={categories}
            paymentMethods={paymentMethods}
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}