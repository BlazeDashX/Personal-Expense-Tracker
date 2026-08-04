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
          <TabsTrigger value="methods">Accounts & Methods</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="shortcuts">Quick Shortcuts</TabsTrigger>
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
        <TabsContent value="shortcuts">
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
             <h3 className="font-medium text-foreground mb-2">Quick Shortcuts Management</h3>
             <p>Create and order the shortcuts that appear on your home dashboard.</p>
             <p className="mt-4 text-xs">(Coming soon in next iteration)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}