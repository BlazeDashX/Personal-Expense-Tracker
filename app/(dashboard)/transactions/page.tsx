// file: app/(dashboard)/transactions/page.tsx
import { getTransactions, getTransactionLookups } from "@/features/transactions/queries/get-transactions";
import { DataTable } from "@/features/transactions/components/data-table";
import { columns } from "@/features/transactions/components/columns";

export default async function TransactionsPage() {
  const [transactions, lookups] = await Promise.all([
    getTransactions(),
    getTransactionLookups()
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Manage cash flow, transfers, and loans.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={transactions} 
        paymentMethods={lookups.paymentMethods}
        people={lookups.people}
      />
    </div>
  );
}