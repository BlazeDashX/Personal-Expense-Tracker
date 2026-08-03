// file: features/expenses/schemas/expense-schema.ts
import { z } from "zod";

export const expenseSchema = z.object({
  id: z.string().optional(),
  expenseDate: z.date({ message: "A date is required." }),
  categoryId: z.string().min(1, "Please select a category."),
  paymentMethodId: z.string().min(1, "Please select a payment method."),
  amount: z.number().min(0.01, "Amount must be greater than 0."),
  description: z.string().min(1, "Please enter a description."),
  notes: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;