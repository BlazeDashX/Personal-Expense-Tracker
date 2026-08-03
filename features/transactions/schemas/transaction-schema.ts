// file: features/transactions/schemas/transaction-schema.ts
import { z } from "zod";

export const transactionTypeEnum = z.enum([
  "CASH_IN",
  "CASH_OUT",
  "LOAN_GIVEN",
  "LOAN_RECEIVED",
  "BORROWED",
  "RETURNED",
  "TRANSFER",
]);

export const transactionSchema = z
  .object({
    id: z.string().optional(),
    transactionDate: z.date({ message: "A date is required." }),
    type: transactionTypeEnum,
    amount: z.number().positive("Amount must be greater than zero."),
    paymentMethodId: z.string().min(1, "Source payment method is required."),
    destinationPaymentMethodId: z.string().optional().nullable(),
    personId: z.string().optional().nullable(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const requiresPerson = ["LOAN_GIVEN", "LOAN_RECEIVED", "BORROWED", "RETURNED"].includes(data.type);

    if (requiresPerson && !data.personId) {
      ctx.addIssue({
        path: ["personId"],
        message: "Person is required for this transaction type.",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.type === "TRANSFER") {
      if (!data.destinationPaymentMethodId) {
        ctx.addIssue({
          path: ["destinationPaymentMethodId"],
          message: "Destination payment method is required for transfers.",
          code: z.ZodIssueCode.custom,
        });
      } else if (data.destinationPaymentMethodId === data.paymentMethodId) {
        ctx.addIssue({
          path: ["destinationPaymentMethodId"],
          message: "Destination must be different from source.",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export type TransactionInput = z.infer<typeof transactionSchema>;