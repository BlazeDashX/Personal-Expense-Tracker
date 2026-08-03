// file: app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-10">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Dashboard under construction
          </h3>
          <p className="text-sm text-muted-foreground">
            Metrics, charts, and quick-add actions will appear here in Phase 9.
          </p>
        </div>
      </div>
    </div>
  );
}