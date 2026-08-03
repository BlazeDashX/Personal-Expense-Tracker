// file: auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { authConfig } from "./auth.config";
import { loginSchema } from "@/features/auth/schemas/login-schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;

          const user = await db.query.users.findFirst({
            where: eq(users.username, username.toLowerCase()),
          });

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (passwordsMatch) {
            return {
              id: user.id,
              username: user.username,
              name: user.name,
            };
          }
        }

        return null;
      },
    }),
  ],
});