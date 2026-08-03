// file: app/(dashboard)/expenses/page.tsx
import { getExpenses, getExpenseLookups } from "@/features/expenses/queries/get-expenses";
import { columns } from "@/features/expenses/components/columns";
import { DataTable } from "@/features/expenses/components/data-table";

export default async function ExpensesPage() {
  const [expenses, lookups] = await Promise.all([
    getExpenses(),
    getExpenseLookups(),
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">Track and manage your daily expenditures.</p>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        categories={lookups.categories}
        paymentMethods={lookups.paymentMethods}
      />
    </div>
  );
}