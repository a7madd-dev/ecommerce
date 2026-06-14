import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { UserRole } from "@/types";

// Edge-safe auth instance — built from the config that has NO DB/Node deps, so
// the middleware bundle never pulls in `pg`/`bcryptjs`.
const { auth } = NextAuth(authConfig);

const ROLE_ACCESS: Record<string, UserRole[]> = {
  "/admin": ["admin"],
  "/admin/products": ["admin"],
  "/admin/orders": ["admin", "agent"],
  "/admin/campaigns": ["admin"],
  "/admin/analytics": ["admin"],
  "/admin/customers": ["admin"],
  "/admin/settings": ["admin"],
  "/dashboard": ["admin"],
  "/dashboard/products": ["admin"],
  "/dashboard/orders": ["admin", "agent"],
  "/dashboard/logs": ["admin"],
};

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin",
  agent: "/admin/orders",
  client: "/",
  guest: "/",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // If already logged in and visiting /login, redirect to role-based destination
  if (pathname === "/login" && req.auth) {
    const userRole = (req.auth.user.role as UserRole) || "client";
    const dest = ROLE_REDIRECTS[userRole] || "/";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Protected admin and legacy dashboard routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole = req.auth.user.role as UserRole;

    // Find the most specific matching route
    const matchedRoute = Object.keys(ROLE_ACCESS)
      .sort((a, b) => b.length - a.length)
      .find((route) => pathname.startsWith(route));

    if (matchedRoute) {
      const allowed = ROLE_ACCESS[matchedRoute];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login"],
};
