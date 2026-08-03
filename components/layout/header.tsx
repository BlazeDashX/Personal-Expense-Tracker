// file: components/layout/header.tsx
import { UserNav } from "./user-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "../shared/theme-toggle";

interface HeaderProps {
  user: {
    name?: string | null;
    username?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-15 lg:px-6">
      <MobileNav />
      <div className="w-full flex-1">
        {/* Future breadcrumbs or page title can go here */}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserNav user={user} />
      </div>
    </header>
  );
}