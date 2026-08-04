import { getBudgetsPageData } from "@/features/budgets/queries/get-budgets-data";
import { BudgetsView } from "@/features/budgets/components/budgets-view";

export default async function BudgetsPage() {
  const data = await getBudgetsPageData();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Budgets & Limits</h1>
        <p className="text-muted-foreground">Manage your monthly spending targets and category warning limits.</p>
      </div>

      <BudgetsView data={data} />
    </div>
  );
}
