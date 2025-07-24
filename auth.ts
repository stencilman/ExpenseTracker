import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

import { getUserById } from "@/data/user";
import { UserRole } from "@prisma/client";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  callbacks: {
    
    // This is called when a user tries to sign in and checks if the user email is verified
    // async signIn({ user }) {
    //   console.log("signIn", user);

    //   if (!user.id) return false;

    //   const existingUser = await getUserById(user.id);

    //   if (!existingUser || !existingUser.emailVerified) {
    //     return false;
    //   }

    //   return true;
    // },

    async session({ session, token }) {
      console.log("sessionToken", token);
      console.log("session", session);

      // Pass anything in the session from the token or custom
      // if (session.user) {
      //   session.user.custom = token.custom;
      //   session.user.test = "test";
      // }

      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      if (session.user && token.role) {
        session.user.role = token.role as UserRole;
      }

      return session;
    },
    async jwt({ token }) {
      console.log("jwt", token);
      // token.custom = "custom";
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;
      token.role = existingUser.role;

      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
