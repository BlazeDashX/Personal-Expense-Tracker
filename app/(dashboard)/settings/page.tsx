// file: app/(dashboard)/settings/page.tsx
import { getSettingsData } from "@/features/settings/queries/get-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesPanel, PaymentMethodsPanel, PeoplePanel, BudgetsPanel, PreferencesPanel } from "@/features/settings/components/settings-panels";

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your master data and application preferences.</p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoriesPanel data={data.categories} />
        </TabsContent>
        <TabsContent value="methods">
          <PaymentMethodsPanel data={data.paymentMethods} />
        </TabsContent>
        <TabsContent value="people">
          <PeoplePanel data={data.people} />
        </TabsContent>
        <TabsContent value="budgets">
          <BudgetsPanel data={data.budgets} />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesPanel data={data.preferences ?? null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}