// file: app/(dashboard)/meals/page.tsx
import { getMeals } from "@/features/meals/queries/get-meals";
import { DataTable } from "@/features/meals/components/data-table";
import { columns } from "@/features/meals/components/columns";

export default async function MealsPage() {
  const meals = await getMeals();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Meals</h1>
        <p className="text-muted-foreground">Track your daily meal consumption.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={meals} 
      />
    </div>
  );
}