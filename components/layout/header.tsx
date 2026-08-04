import { UserNav } from "./user-nav";
import { ThemeToggle } from "../shared/theme-toggle";
import { GlobalAddMenu } from "./global-add-menu";

interface HeaderProps {
  user: {
    name?: string | null;
    username?: string | null;
  };
  categories?: any[];
  paymentMethods?: any[];
}

export function Header({ user, categories = [], paymentMethods = [] }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-15 lg:px-6">
      <div className="w-full flex-1">
        {/* Future breadcrumbs or page title can go here */}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <GlobalAddMenu categories={categories} paymentMethods={paymentMethods} />
        </div>
        <ThemeToggle />
        <UserNav user={user} />
      </div>
    </header>
  );
}