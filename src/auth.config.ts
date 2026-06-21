import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config — no Prisma/bcrypt here, so this can be loaded by
 * middleware without bundling Node-only database drivers into that runtime.
 * The full config (with the Credentials provider's database lookup) lives in
 * src/auth.ts and spreads this object.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
