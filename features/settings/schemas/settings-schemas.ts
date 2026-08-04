// file: features/settings/schemas/settings-schemas.ts
import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  icon: z.string().min(1, "Icon name is required"),
  color: z.string().min(1, "Color is required"),
});

export const paymentMethodSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon name is required"),
  color: z.string().min(1, "Color is required"),
});

export const personSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const budgetSchema = z.object({
  id: z.string().optional(),
  budgetMonth: z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM"),
  amount: z.number().min(0, "Amount must be positive"),
  notes: z.string().optional(),
});

export const preferencesSchema = z.object({
  currencyCode: z.string().min(1, "Currency code is required"),
  weekStartsOn: z.string().min(1, "Week start day is required"),
  mealTarget: z.number().min(0, "Must be at least 0"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;
export type PersonFormValues = z.infer<typeof personSchema>;
export type BudgetFormValues = z.infer<typeof budgetSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesSchema>;