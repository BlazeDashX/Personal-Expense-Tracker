"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { IconPicker } from "@/components/shared/icon-picker";
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
  deleteCategory,
  savePaymentMethod,
  deletePaymentMethod,
  savePerson,
  deletePerson,
  saveBudget,
  deleteBudget,
  toggleShortcutInstantMode,
  deleteQuickShortcut,
  savePreferences,
} from "../actions/settings-actions";
import { fromMinorUnits, formatMoney } from "@/lib/finance";
import { Plus, Pencil, Trash2, Zap, User, Calculator, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { categories, paymentMethods, people, monthlyBudgets, userPreferences, quickShortcuts } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Category = InferSelectModel<typeof categories>;
export type PaymentMethod = InferSelectModel<typeof paymentMethods>;
export type Person = InferSelectModel<typeof people>;
export type MonthlyBudget = InferSelectModel<typeof monthlyBudgets>;
export type UserPreferences = InferSelectModel<typeof userPreferences>;
export type QuickShortcut = InferSelectModel<typeof quickShortcuts> & {
  category?: Category | null;
  paymentMethod?: PaymentMethod | null;
};

type IconComponent = React.ComponentType<{ className?: string }>;
const iconMap = Icons as unknown as Record<string, IconComponent>;

// Helper component to bind IconPicker with watch color
function CategoryIconField({ control }: { control: ReturnType<typeof useForm<CategoryFormValues>>["control"] }) {
  const color = useWatch({ control, name: "color" });
  return (
    <FormField
      control={control}
      name="icon"
      render={({ field }: { field: ControllerRenderProps<CategoryFormValues, "icon"> }) => (
        <FormItem>
          <FormLabel>Icon</FormLabel>
          <FormControl>
            <IconPicker value={field.value} onChange={field.onChange} color={color} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function MethodIconField({ control }: { control: ReturnType<typeof useForm<PaymentMethodFormValues>>["control"] }) {
  const color = useWatch({ control, name: "color" });
  return (
    <FormField
      control={control}
      name="icon"
      render={({ field }: { field: ControllerRenderProps<PaymentMethodFormValues, "icon"> }) => (
        <FormItem>
          <FormLabel>Icon</FormLabel>
          <FormControl>
            <IconPicker value={field.value} onChange={field.onChange} color={color} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// --- 1. Categories Panel ---
export function CategoriesPanel({ data }: { data: Category[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", icon: "Tag", color: "#e7a33e" },
  });

  const handleOpen = (item?: Category) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        id: item.id,
        name: item.name,
        slug: item.slug,
        icon: item.icon || (item.name === "Cigar" ? "Cigarette" : "Tag"),
        color: item.color || "#e7a33e",
      });
    } else {
      setEditingId(null);
      form.reset({ name: "", slug: "", icon: "Tag", color: "#e7a33e" });
    }
    setOpen(true);
  };

  const onSubmit = (values: CategoryFormValues) => {
    startTransition(async () => {
      const res = await saveCategory({ ...values, id: editingId ?? undefined });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Category saved!");
        setOpen(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Category deleted. Expenses reassigned to default category.");
        setDeletingId(null);
      }
    });
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">Categories</CardTitle>
          <CardDescription>Manage expense categories and colors.</CardDescription>
        </div>
        <Button onClick={() => handleOpen()} className="rounded-xl font-semibold">
          <Plus className="mr-1.5 h-4 w-4" /> Add Category
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => {
          const rawIcon = item.icon || (item.name === "Cigar" ? "Cigarette" : "Tag");
          const IconComp = iconMap[rawIcon] || Icons.Tag;
          const color = item.color || "#e7a33e";

          return (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border bg-muted/20 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    {item.name}
                    {item.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">Default</span>}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">/{item.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleOpen(item)} className="h-8 rounded-lg">
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                {!item.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => setDeletingId(item.id)} className="h-8 rounded-lg text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
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
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!form.getValues("slug")) {
                            form.setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                          }
                        }}
                        className="rounded-xl"
                      />
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
                      <Input {...field} className="rounded-xl font-mono text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <CategoryIconField control={form.control} />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }: { field: ControllerRenderProps<CategoryFormValues, "color"> }) => (
                    <FormItem>
                      <FormLabel>Identity Color</FormLabel>
                      <FormControl>
                        <Input type="color" className="h-10 px-1 rounded-xl cursor-pointer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full rounded-xl font-semibold">
                Save Category
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Any existing expenses currently tagged with this category will be reassigned to your default fallback category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// --- 2. Payment Methods Panel ---
export function PaymentMethodsPanel({ data }: { data: PaymentMethod[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { name: "", icon: "Wallet", color: "#10b981" },
  });

  const handleOpen = (item?: PaymentMethod) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        id: item.id,
        name: item.name,
        icon: item.icon || "Wallet",
        color: item.color || "#10b981",
      });
    } else {
      setEditingId(null);
      form.reset({ name: "", icon: "Wallet", color: "#10b981" });
    }
    setOpen(true);
  };

  const onSubmit = (values: PaymentMethodFormValues) => {
    startTransition(async () => {
      const res = await savePaymentMethod({ ...values, id: editingId ?? undefined });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Payment method saved!");
        setOpen(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deletePaymentMethod(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Payment method deleted.");
        setDeletingId(null);
      }
    });
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">Payment Methods</CardTitle>
          <CardDescription>Manage sources and accounts for payments and transfers.</CardDescription>
        </div>
        <Button onClick={() => handleOpen()} className="rounded-xl font-semibold">
          <Plus className="mr-1.5 h-4 w-4" /> Add Method
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => {
          const IconComp = iconMap[item.icon] || Icons.Wallet;
          const color = item.color || "#10b981";

          return (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border bg-muted/20 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  {item.name}
                  {item.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">Default</span>}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleOpen(item)} className="h-8 rounded-lg">
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                {!item.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => setDeletingId(item.id)} className="h-8 rounded-lg text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
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
                    <FormLabel>Method / Account Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <MethodIconField control={form.control} />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }: { field: ControllerRenderProps<PaymentMethodFormValues, "color"> }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input type="color" className="h-10 px-1 rounded-xl cursor-pointer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full rounded-xl font-semibold">
                Save Method
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// --- 3. People Panel ---
export function PeoplePanel({ data }: { data: Person[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
      if (res.error) toast.error(res.error);
      else {
        toast.success("Person saved!");
        setOpen(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deletePerson(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Person deleted.");
        setDeletingId(null);
      }
    });
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">People & Contacts</CardTitle>
          <CardDescription>Manage contacts for loans given and borrowed.</CardDescription>
        </div>
        <Button onClick={() => handleOpen()} className="rounded-xl font-semibold">
          <Plus className="mr-1.5 h-4 w-4" /> Add Person
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border bg-muted/20 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{item.name}</p>
                {item.phone && <p className="text-xs text-muted-foreground font-mono">{item.phone}</p>}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleOpen(item)} className="h-8 rounded-lg">
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeletingId(item.id)} className="h-8 rounded-lg text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
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
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl" />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl font-mono text-xs" />
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
                      <Input {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full rounded-xl font-semibold">
                Save Contact
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? Existing loan records will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// --- 4. Budgets Panel ---
export function BudgetsPanel({ data }: { data: MonthlyBudget[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
      if (res.error) toast.error(res.error);
      else {
        toast.success("Budget saved!");
        setOpen(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteBudget(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Budget target deleted.");
        setDeletingId(null);
      }
    });
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">Monthly Budgets</CardTitle>
          <CardDescription>Set targets and daily safe pace allowances for each month.</CardDescription>
        </div>
        <Button onClick={() => handleOpen()} className="rounded-xl font-semibold">
          <Plus className="mr-1.5 h-4 w-4" /> Add Budget
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border bg-muted/20 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground font-mono">{item.budgetMonth}</p>
                <p className="text-xs text-muted-foreground font-mono tabular-nums font-semibold">{formatMoney(item.amount)}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleOpen(item)} className="h-8 rounded-lg">
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeletingId(item.id)} className="h-8 rounded-lg text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
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
                    <FormLabel>Budget Month (YYYY-MM)</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} className="rounded-xl" />
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
                    <FormLabel>Budget Amount (BDT ৳)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        className="rounded-xl font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full rounded-xl font-semibold">
                Save Budget Target
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget Target?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this monthly budget target?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// --- 5. Quick Shortcuts Panel ---
export function QuickShortcutsPanel({
  shortcuts,
}: {
  shortcuts: QuickShortcut[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleInstant = (id: string, currentInstant: number) => {
    startTransition(async () => {
      const res = await toggleShortcutInstantMode(id, currentInstant);
      if (res.error) toast.error(res.error);
      else toast.success("Shortcut mode updated!");
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteQuickShortcut(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Shortcut deleted.");
        setDeletingId(null);
      }
    });
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-xs space-y-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Dashboard Quick Shortcuts
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Single source of truth for the 1-tap and popover quick-entry grid on your home dashboard.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {shortcuts.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-2xl text-xs text-muted-foreground">
            No quick shortcuts configured yet.
          </div>
        ) : (
          shortcuts.map((sc) => {
            const IconComp = iconMap[sc.icon] || Icons.Zap;
            const color = sc.color || "#e7a33e";
            const isInstant = sc.instantMode === 1;

            return (
              <div key={sc.id} className="flex items-center justify-between p-3.5 rounded-2xl border bg-muted/20 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                      {sc.title}
                      <span className="text-xs font-mono tabular-nums font-bold text-primary">
                        {formatMoney(sc.amount)}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span>{sc.category?.name || sc.paymentMethod?.name}</span>
                      <span>•</span>
                      <span className={cn("font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold", isInstant ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                        {isInstant ? "1-Tap Instant" : "Popover Form"}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground hidden sm:inline">1-Tap Log</span>
                    <Switch
                      checked={isInstant}
                      onCheckedChange={() => handleToggleInstant(sc.id, sc.instantMode)}
                      disabled={isPending}
                    />
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => setDeletingId(sc.id)} className="h-8 rounded-lg text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shortcut?</AlertDialogTitle>
            <AlertDialogDescription>
              This shortcut will be removed from your home dashboard grid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// --- 6. Preferences Panel ---
export function PreferencesPanel({ data }: { data: UserPreferences | null | undefined }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      currencyCode: data?.currencyCode || "BDT",
      weekStartsOn: String(data?.weekStartsOn ?? "0"),
      mealTarget: data?.mealTarget ?? 3,
    },
  });

  const onSubmit = (values: PreferencesFormValues) => {
    startTransition(async () => {
      const res = await savePreferences(values);
      if (res.error) toast.error(res.error);
      else toast.success("Preferences saved successfully!");
    });
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Application Preferences
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Configure localization, meal habits, and formatting preferences across the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <FormField
              control={form.control}
              name="currencyCode"
              render={({ field }: { field: ControllerRenderProps<PreferencesFormValues, "currencyCode"> }) => (
                <FormItem>
                  <FormLabel>Currency Symbol / Code</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 rounded-xl bg-background">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="BDT">BDT (৳ - Bangladeshi Taka)</SelectItem>
                      <SelectItem value="USD">USD ($ - US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (€ - Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weekStartsOn"
              render={({ field }: { field: ControllerRenderProps<PreferencesFormValues, "weekStartsOn"> }) => (
                <FormItem>
                  <FormLabel>First Day of Week</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 rounded-xl bg-background">
                      <SelectValue placeholder="First Day" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="0">Sunday (Default)</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mealTarget"
              render={({ field }: { field: ControllerRenderProps<PreferencesFormValues, "mealTarget"> }) => (
                <FormItem>
                  <FormLabel>Daily Meal Habit Target</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 3)}
                      className="rounded-xl font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="rounded-xl font-semibold px-6">
              Save Preferences
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}