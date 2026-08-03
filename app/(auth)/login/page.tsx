// file: app/(auth)/login/page.tsx
import { LoginForm } from "@/features/auth/components/login-form";
import { WalletCards } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <WalletCards className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Expense Tracker</h1>
      </div>
      <LoginForm />
    </main>
  );
}