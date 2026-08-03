// file: features/meals/schemas/meal-schema.ts
import { z } from "zod";

export const mealSchema = z.object({
  id: z.string().optional(),
  mealDate: z.date({ message: "A date is required." }),
  mealCount: z
    .number()
    .int("Must be a whole number")
    .min(0, "Cannot be less than 0")
    .max(2, "Maximum 2 meals allowed per day"),
  notes: z.string().optional(),
});

export type MealInput = z.infer<typeof mealSchema>;