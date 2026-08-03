// file: components/layout/user-nav.tsx
"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/actions/logout";
import { cn } from "@/lib/utils";

interface UserNavProps {
  user: {
    name?: string | null;
    username?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  return (
    <DropdownMenu>
      {/* FIXED: Removed asChild and used buttonVariants directly on the trigger */}
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "secondary", size: "icon" }), "rounded-full")}>
        <UserIcon className="h-5 w-5" />
        <span className="sr-only">Toggle user menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive cursor-pointer" 
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}