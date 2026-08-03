// file: features/auth/actions/login.ts
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { loginSchema, LoginInput } from "../schemas/login-schema";

export async function login(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid credentials" };
  }

  try {
    await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid username or password." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error; // Next.js requires this throw for redirects to work
  }
}