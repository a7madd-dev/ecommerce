import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types";

// ============================================================================
// Edge-safe NextAuth config.
//
// This half contains ONLY what the middleware needs to verify a session from
// the JWT cookie: the jwt/session callbacks and the custom pages. It must not
// import anything that pulls in Node-only modules (e.g. `pg`, `bcryptjs`),
// because the middleware runs on the Edge runtime.
//
// The DB-backed Credentials provider lives in `lib/auth.ts`, which spreads this
// config and adds the provider — that instance runs only in Node (route
// handlers + server actions).
// ============================================================================

export const authConfig: NextAuthConfig = {
  trustHost: true,
  // Providers are added in lib/auth.ts. Middleware only decodes the JWT, so an
  // empty list here is fine for session verification.
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.id = user.id!;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
