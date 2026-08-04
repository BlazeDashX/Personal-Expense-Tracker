// file: features/people/queries/get-people-data.ts
import { db } from "@/db";
import { people, transactions, paymentMethods } from "@/db/schema";
import { eq, isNotNull, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { fromMinorUnits } from "@/lib/finance";

export async function getPeoplePageData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const [allPeople, loanTransactions, pms] = await Promise.all([
    db.query.people.findMany({ where: eq(people.userId, userId) }),
    db.query.transactions.findMany({
      where: isNotNull(transactions.personId),
      with: { paymentMethod: true, person: true },
      orderBy: [desc(transactions.transactionDate)],
    }),
    db.query.paymentMethods.findMany({ where: eq(paymentMethods.userId, userId) }),
  ]);

  // Group transactions by person ID
  const txByPerson = new Map<string, typeof loanTransactions>();
  loanTransactions.forEach((tx) => {
    if (!tx.personId) return;
    const existing = txByPerson.get(tx.personId) || [];
    existing.push(tx);
    txByPerson.set(tx.personId, existing);
  });

  // Build person list with net balances
  const peopleWithBalances = allPeople.map((person) => {
    const history = txByPerson.get(person.id) || [];

    let totalLent = 0;
    let totalBorrowed = 0;
    let totalReturned = 0;

    history.forEach((tx) => {
      const amt = fromMinorUnits(tx.amount);
      if (tx.type === "LOAN_GIVEN") {
        totalLent += amt;
      } else if (tx.type === "BORROWED" || tx.type === "LOAN_RECEIVED") {
        totalBorrowed += amt;
      } else if (tx.type === "RETURNED") {
        totalReturned += amt;
      }
    });

    // Net balance calculation:
    // Positive balance = they owe you money
    // Negative balance = you owe them money
    // Formula: (LOAN_GIVEN - RETURNED) - (BORROWED/LOAN_RECEIVED - RETURNED)
    let netBalance = 0;
    if (totalLent >= totalBorrowed) {
      netBalance = (totalLent - totalBorrowed) - totalReturned;
    } else {
      netBalance = -((totalBorrowed - totalLent) - totalReturned);
    }

    return {
      id: person.id,
      name: person.name,
      phone: person.phone,
      notes: person.notes,
      totalLent,
      totalBorrowed,
      totalReturned,
      netBalance,
      historyCount: history.length,
      history: history.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: fromMinorUnits(tx.amount),
        date: tx.transactionDate,
        notes: tx.notes,
        paymentMethodName: tx.paymentMethod?.name || "Cash",
      })),
    };
  });

  // Default Sort: Sort people by absolute net balance descending
  peopleWithBalances.sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));

  return {
    people: peopleWithBalances,
    paymentMethods: pms.map((p) => ({ id: p.id, name: p.name, icon: p.icon })),
  };
}

export type PeoplePageData = Awaited<ReturnType<typeof getPeoplePageData>>;
