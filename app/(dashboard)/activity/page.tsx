import { getActivity } from "@/features/activity/queries/get-activity";
import { getDashboardLookups } from "@/features/dashboard/queries/get-metrics";
import { ActivityFeed } from "@/features/activity/components/activity-feed";

export default async function ActivityPage() {
  const [data, lookups] = await Promise.all([
    getActivity(),
    getDashboardLookups()
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
          <p className="text-muted-foreground">Review your expenses, income, and transfers.</p>
        </div>
      </div>
      
      <ActivityFeed 
        data={data} 
        categories={lookups.categories} 
        paymentMethods={lookups.paymentMethods} 
        people={lookups.people} 
      />
    </div>
  );
}
