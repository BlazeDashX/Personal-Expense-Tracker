// file: features/transactions/queries/get-transactions.ts
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { fromMinorUnits } from "@/lib/finance";

export async function getTransactions() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = await db.query.transactions.findMany({
    where: eq(transactions.userId, session.user.id),
    orderBy: [desc(transactions.transactionDate)],
    with: {
      person: true,
      paymentMethod: true,
      destinationPaymentMethod: true,
    },
  });

  return data.map((txn) => ({
    ...txn,
    amount: fromMinorUnits(txn.amount),
  }));
}

export async function getTransactionLookups() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [pms, ppl] = await Promise.all([
    db.query.paymentMethods.findMany({ where: eq(transactions.userId, session.user.id) }),
    db.query.people.findMany({ where: eq(transactions.userId, session.user.id) }),
  ]);

  return { paymentMethods: pms, people: ppl };
}