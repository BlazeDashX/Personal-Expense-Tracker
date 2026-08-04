import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardLookups } from "@/features/dashboard/queries/get-metrics";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const lookups = await getDashboardLookups();

  return (
    <DashboardShell user={session.user} lookups={lookups}>
      {children}
    </DashboardShell>
  );
}