import { getPeoplePageData } from "@/features/people/queries/get-people-data";
import { PeopleView } from "@/features/people/components/people-view";

export default async function PeoplePage() {
  const data = await getPeoplePageData();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">People & Debts</h1>
        <p className="text-muted-foreground">Manage informal lending, contact balances, and repayments.</p>
      </div>

      <PeopleView data={data} />
    </div>
  );
}
