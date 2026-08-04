import { getMealsData } from "@/features/meals/queries/get-meals";
import { MealTracker } from "@/features/meals/components/meal-tracker";

export default async function MealsPage() {
  const { meals, target } = await getMealsData();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <MealTracker meals={meals} target={target} />
    </div>
  );
}