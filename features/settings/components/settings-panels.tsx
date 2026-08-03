// file: features/settings/components/settings-panels.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  categorySchema,
  paymentMethodSchema,
  personSchema,
  budgetSchema,
  preferencesSchema,
  type CategoryFormValues,
  type PaymentMethodFormValues,
  type PersonFormValues,
  type BudgetFormValues,
  type PreferencesFormValues,
} from "../schemas/settings-schemas";
import {
  saveCategory,
  savePaymentMethod,
  savePerson,
  saveBudget,
  savePreferences,
} from "../actions/settings-actions";
import { fromMinorUnits, formatMoney } from "@/lib/finance";
import type { categories, paymentMethods, people, monthlyBudgets, userPreferences } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Category = InferSelectModel<typeof categories>;
export type PaymentMethod = InferSelectModel<typeof paymentMethods>;
export type Person = InferSelectModel<typeof people>;
export type MonthlyBudget = InferSelectModel<typeof monthlyBudgets>;
export type UserPreferences = InferSelectModel<typeof userPreferences>;

type IconComponent = React.ComponentType<{ className?: string }>;
const iconMap = Icons as unknown as Record<string, IconComponent>;

// --- Categories Panel ---
export function CategoriesPanel({ data }: { data: Category[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", icon: "Circle", color: "#000000" },
  });

  const handleOpen = (item?: Category) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        id: item.id,
        name: item.name,
        slug: item.slug,
        icon: item.icon,
        color: item.color,
      });
    } else {
      setEditingId(null);
      form.reset({ name: "", slug: "", icon: "Circle", color: "#000000" });
    }
    setOpen(true);
  };

  const onSubmit = (values: CategoryFormValues) => {
    startTransition(async () => {
      const res = await saveCategory({ ...values, id: editingId ?? undefined });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Category saved!");
        setOpen(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage expense categories.</CardDescription>
        </div>
        <Button onClick={() => handleOpen()}>Add Category</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const Icon = iconMap[item.icon] || Icons.HelpCircle;
          return (
            <div key={item.id} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md" style={{ backgroundColor: item.color + "20", color: item.color }}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium">
                  {item.name}{" "}
                  {item.isDefault && <span className="text-xs text-muted-foreground">(Default)</span>}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleOpen(item)}>
                Edit
              </Button>
            </div>
          );
        })}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: ControllerRenderProps<CategoryFormValues, "name"> }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }: { field: ControllerRenderProps<CategoryFormValues, "slug"> }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }: { field: ControllerRenderProps<CategoryFormValues, "icon"> }) => (
                    <FormItem>
                      <FormLabel>Lucide Icon</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }: { field: ControllerRenderProps<CategoryFormValues, "color"> }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input type="color" className="h-10 px-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                Save
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// --- Payment Methods Panel ---
export function PaymentMethodsPanel({ data }: { data: PaymentMethod[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { name: "", icon: "Wallet", color: "#000000" },
  });

  const handleOpen = (item?: PaymentMethod) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        id: item.id,
        name: item.name,
        icon: item.icon,
        color: item.color,
      });
    } else {
      setEditingId(null);
      form.reset({ name: "", icon: "Wallet", color: "#000000" });
    }
    setOpen(true);
  };

  const onSubmit = (values: PaymentMethodFormValues) => {
    startTransition(async () => {
      const res = await savePaymentMethod({ ...values, id: editingId ?? undefined });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Payment method saved!");
        setOpen(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage sources and destinations for transactions.</CardDescription>
        </div>
        <Button onClick={() => handleOpen()}>Add Method</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const Icon = iconMap[item.icon] || Icons.HelpCircle;
          return (
            <div key={item.id} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md" style={{ backgroundColor: item.color + "20", color: item.color }}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{item.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleOpen(item)}>
                Edit
              </Button>
            </div>
          );
        })}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Method" : "New Method"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: ControllerRenderProps<PaymentMethodFormValues, "name"> }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }: { field: ControllerRenderProps<PaymentMethodFormValues, "icon"> }) => (
                    <FormItem>
                      <FormLabel>Lucide Icon</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }: { field: ControllerRenderProps<PaymentMethodFormValues, "color"> }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input type="color" className="h-10 px-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                Save
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// --- People Panel ---
export function PeoplePanel({ data }: { data: Person[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: { name: "", phone: "", notes: "" },
  });

  const handleOpen = (item?: Person) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        id: item.id,
        name: item.name,
        phone: item.phone ?? "",
        notes: item.notes ?? "",
      });
    } else {
      setEditingId(null);
      form.reset({ name: "", phone: "", notes: "" });
    }
    setOpen(true);
  };

  const onSubmit = (values: PersonFormValues) => {
    startTransition(async () => {
      const res = await savePerson({ ...values, id: editingId ?? undefined });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Person saved!");
        setOpen(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>People</CardTitle>
          <CardDescription>Manage contacts for loans and borrowing.</CardDescription>
        </div>
        <Button onClick={() => handleOpen()}>Add Person</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">{item.name}</p>
              {item.phone && <p className="text-sm text-muted-foreground">{item.phone}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleOpen(item)}>
              Edit
            </Button>
          </div>
        ))}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Person" : "New Person"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: ControllerRenderProps<PersonFormValues, "name"> }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }: { field: ControllerRenderProps<PersonFormValues, "phone"> }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }: { field: ControllerRenderProps<PersonFormValues, "notes"> }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full">
                Save
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// --- Budgets Panel ---
export function BudgetsPanel({ data }: { data: MonthlyBudget[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { budgetMonth: "", amount: 0, notes: "" },
  });

  const handleOpen = (item?: MonthlyBudget) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        id: item.id,
        budgetMonth: item.budgetMonth,
        amount: fromMinorUnits(item.amount),
        notes: item.notes ?? "",
      });
    } else {
      setEditingId(null);
      form.reset({ budgetMonth: new Date().toISOString().slice(0, 7), amount: 0, notes: "" });
    }
    setOpen(true);
  };

  const onSubmit = (values: BudgetFormValues) => {
    startTransition(async () => {
      const res = await saveBudget({ ...values, id: editingId ?? undefined });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Budget saved!");
        setOpen(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Budgets</CardTitle>
          <CardDescription>Set targets for your monthly expenses.</CardDescription>
        </div>
        <Button onClick={() => handleOpen()}>Add Budget</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">{item.budgetMonth}</p>
              <p className="text-sm text-muted-foreground">{formatMoney(item.amount)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleOpen(item)}>
              Edit
            </Button>
          </div>
        ))}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Budget" : "New Budget"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="budgetMonth"
                render={({ field }: { field: ControllerRenderProps<BudgetFormValues, "budgetMonth"> }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }: { field: ControllerRenderProps<BudgetFormValues, "amount"> }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }: { field: ControllerRenderProps<BudgetFormValues, "notes"> }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full">
                Save
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// --- Preferences Panel ---
export function PreferencesPanel({ data }: { data: UserPreferences | null | undefined }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      currencyCode: data?.currencyCode || "BDT",
      weekStartsOn: String(data?.weekStartsOn ?? "0"),
    },
  });

  const onSubmit = (values: PreferencesFormValues) => {
    startTransition(async () => {
      const res = await savePreferences(values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Preferences saved!");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
        <CardDescription>Configure localization and formatting.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
            <FormField
              control={form.control}
              name="currencyCode"
              render={({ field }: { field: ControllerRenderProps<PreferencesFormValues, "currencyCode"> }) => (
                <FormItem>
                  <FormLabel>Currency Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weekStartsOn"
              render={({ field }: { field: ControllerRenderProps<PreferencesFormValues, "weekStartsOn"> }) => (
                <FormItem>
                  <FormLabel>Week Starts On (0=Sun, 1=Mon)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              Save Preferences
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}