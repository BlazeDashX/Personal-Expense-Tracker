// file: features/transactions/components/transaction-form.tsx
"use client";

import { useTransition } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { transactionSchema, type TransactionInput } from "../schemas/transaction-schema";
import { saveTransaction } from "../actions/transaction-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PaymentMethod, Person } from "@/features/settings/components/settings-panels";
import type { TransactionColumnType } from "./columns";

interface TransactionFormProps {
  initialData?: TransactionColumnType | null;
  paymentMethods: PaymentMethod[];
  people: Person[];
  onSuccess: () => void;
}

export function TransactionForm({ initialData, paymentMethods, people, onSuccess }: TransactionFormProps) {
  "use no memo";
  const [isPending, startTransition] = useTransition();

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      transactionDate: initialData?.transactionDate ? new Date(initialData.transactionDate) : new Date(),
      type: initialData?.type || "CASH_IN",
      amount: initialData?.amount || 0,
      paymentMethodId: initialData?.paymentMethod?.id || "",
      destinationPaymentMethodId: initialData?.destinationPaymentMethod?.id || "",
      personId: initialData?.person?.id || "",
      notes: initialData?.notes || "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedType = form.watch("type");
  const requiresPerson = ["LOAN_GIVEN", "LOAN_RECEIVED", "BORROWED", "RETURNED"].includes(selectedType);
  const isTransfer = selectedType === "TRANSFER";

  const onSubmit = (values: TransactionInput) => {
    startTransition(async () => {
      const res = await saveTransaction(values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Transaction saved successfully!");
        form.reset();
        onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }: { field: ControllerRenderProps<TransactionInput, "transactionDate"> }) => (
              <FormItem className="flex flex-col mt-2">
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
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }: { field: ControllerRenderProps<TransactionInput, "type"> }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CASH_IN">Cash In</SelectItem>
                    <SelectItem value="CASH_OUT">Cash Out</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="LOAN_GIVEN">Loan Given</SelectItem>
                    <SelectItem value="LOAN_RECEIVED">Loan Received</SelectItem>
                    <SelectItem value="BORROWED">Borrowed</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
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
            name="paymentMethodId"
            render={({ field }: { field: ControllerRenderProps<TransactionInput, "paymentMethodId"> }) => (
              <FormItem>
                <FormLabel>{isTransfer ? "From Account" : "Account"}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
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
          <FormField
            control={form.control}
            name="amount"
            render={({ field }: { field: ControllerRenderProps<TransactionInput, "amount"> }) => (
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
        </div>

        {isTransfer && (
          <FormField
            control={form.control}
            name="destinationPaymentMethodId"
            render={({ field }: { field: ControllerRenderProps<TransactionInput, "destinationPaymentMethodId"> }) => (
              <FormItem>
                <FormLabel>To Account</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
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
        )}

        {requiresPerson && (
          <FormField
            control={form.control}
            name="personId"
            render={({ field }: { field: ControllerRenderProps<TransactionInput, "personId"> }) => (
              <FormItem>
                <FormLabel>Person</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {people.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: ControllerRenderProps<TransactionInput, "notes"> }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Transaction"}
        </Button>
      </form>
    </Form>
  );
}