// file: features/meals/components/meal-form.tsx
"use client";

import { useTransition } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { mealSchema, type MealInput } from "../schemas/meal-schema";
import { saveMeal } from "../actions/meal-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MealColumnType } from "./columns";

interface MealFormProps {
  initialData?: MealColumnType | null;
  onSuccess: () => void;
}

export function MealForm({ initialData, onSuccess }: MealFormProps) {
  "use no memo";
  const [isPending, startTransition] = useTransition();

  const form = useForm<MealInput>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      mealDate: initialData?.mealDate ? new Date(initialData.mealDate) : new Date(),
      mealCount: initialData?.mealCount ?? 2,
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = (values: MealInput) => {
    startTransition(async () => {
      const res = await saveMeal(values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Meal record saved!");
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
            name="mealDate"
            render={({ field }: { field: ControllerRenderProps<MealInput, "mealDate"> }) => (
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
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mealCount"
            render={({ field }: { field: ControllerRenderProps<MealInput, "mealCount"> }) => (
              <FormItem>
                <FormLabel>Meal Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormDescription>0, 1, or 2</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: ControllerRenderProps<MealInput, "notes"> }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl><Input placeholder="E.g., Skipped lunch" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Record"}
        </Button>
      </form>
    </Form>
  );
}