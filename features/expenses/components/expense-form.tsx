// file: features/expenses/components/expense-form.tsx
"use client";

import { useTransition } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { expenseSchema, type ExpenseInput } from "../schemas/expense-schema";
import { saveExpense } from "../actions/expense-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Category, PaymentMethod } from "@/features/settings/components/settings-panels";
import type { ExpenseColumnType } from "./columns";

interface ExpenseFormProps {
  initialData?: ExpenseColumnType | null;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onSuccess: () => void;
}

export function ExpenseForm({ initialData, categories, paymentMethods, onSuccess }: ExpenseFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      expenseDate: initialData?.expenseDate ? new Date(initialData.expenseDate) : new Date(),
      categoryId: initialData?.category ? categories.find(c => c.name === initialData.category.name)?.id || "" : "",
      paymentMethodId: initialData?.paymentMethod ? paymentMethods.find(pm => pm.name === initialData.paymentMethod.name)?.id || "" : "",
      amount: initialData?.amount || 0,
      description: initialData?.description || "",
      notes: "",
    },
  });

  const onSubmit = (values: ExpenseInput) => {
    startTransition(async () => {
      const res = await saveExpense(values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Expense saved successfully!");
        form.reset();
        onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="expenseDate"
          render={({ field }: { field: ControllerRenderProps<ExpenseInput, "expenseDate"> }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <FormControl>
                  <PopoverTrigger
                    type="button"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-between pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }: { field: ControllerRenderProps<ExpenseInput, "categoryId"> }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentMethodId"
            render={({ field }: { field: ControllerRenderProps<ExpenseInput, "paymentMethodId"> }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentMethods.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }: { field: ControllerRenderProps<ExpenseInput, "amount"> }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">৳</span>
                    <Input 
                      placeholder="0.00" 
                      type="number" 
                      step="0.01" 
                      className="pl-7 font-mono tabular-nums" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      autoFocus
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }: { field: ControllerRenderProps<ExpenseInput, "description"> }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input placeholder="E.g., Groceries" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: ControllerRenderProps<ExpenseInput, "notes"> }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Expense"}
        </Button>
      </form>
    </Form>
  );
}