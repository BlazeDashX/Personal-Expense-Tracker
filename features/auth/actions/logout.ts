// file: features/auth/actions/logout.ts
"use server";

import { signOut } from "@/auth";

export async function logout() {
  await signOut({ redirectTo: "/login" });
}