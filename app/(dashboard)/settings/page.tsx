import { getSettingsData } from "@/features/settings/queries/get-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CategoriesPanel,
  PaymentMethodsPanel,
  PeoplePanel,
  BudgetsPanel,
  PreferencesPanel,
  QuickShortcutsPanel,
} from "@/features/settings/components/settings-panels";

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage master data, dashboard shortcuts, and application preferences.</p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto p-1.5 rounded-2xl bg-muted border">
          <TabsTrigger value="categories" className="rounded-xl">Categories</TabsTrigger>
          <TabsTrigger value="methods" className="rounded-xl">Accounts & Methods</TabsTrigger>
          <TabsTrigger value="people" className="rounded-xl">People</TabsTrigger>
          <TabsTrigger value="budgets" className="rounded-xl">Budgets</TabsTrigger>
          <TabsTrigger value="shortcuts" className="rounded-xl">Quick Shortcuts</TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-xl">Preferences</TabsTrigger>
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

        <TabsContent value="shortcuts">
          <QuickShortcutsPanel
            shortcuts={data.shortcuts}
            categories={data.categories}
            paymentMethods={data.paymentMethods}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesPanel data={data.preferences ?? null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}