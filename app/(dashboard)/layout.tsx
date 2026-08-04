import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardLookups } from "@/features/dashboard/queries/get-metrics";
import { getNotifications } from "@/features/notifications/queries/get-notifications";
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

  const [lookups, userNotifications] = await Promise.all([
    getDashboardLookups(),
    getNotifications(),
  ]);

  return (
    <DashboardShell user={session.user} lookups={lookups} notifications={userNotifications}>
      {children}
    </DashboardShell>
  );
}