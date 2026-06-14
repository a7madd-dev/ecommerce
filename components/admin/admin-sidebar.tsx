"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Store,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Rocket,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/campaigns/create", label: "Start Campaign", icon: Rocket },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Header */}
      <div className={cn("flex items-center h-16 border-b px-4", collapsed && !isMobile ? "justify-center" : "justify-between")}>
        <Link
          href="/admin"
          className={cn("flex items-center gap-2 font-bold text-lg transition-all", collapsed && !isMobile && "justify-center")}
        >
          <Store className="size-5 text-primary flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Admin</span>}
        </Link>
        {isMobile ? (
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="size-5" />
          </Button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors hidden lg:flex"
          >
            <ChevronLeft className={cn("size-4 transition-transform duration-200", collapsed && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const isStartCampaign = link.href === "/admin/campaigns/create";
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed && !isMobile ? link.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                collapsed && !isMobile && "justify-center px-2",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isStartCampaign
                  ? "text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className={cn("size-5 flex-shrink-0", isStartCampaign && !active && "text-primary")} />
              {(!collapsed || isMobile) && (
                <span className="truncate">{link.label}</span>
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && !isMobile && (
                <span className="absolute left-full ml-2 px-2.5 py-1 rounded-lg bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-2 space-y-0.5">
        <Link
          href="/"
          title={collapsed && !isMobile ? "Back to Store" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group relative",
            collapsed && !isMobile && "justify-center px-2"
          )}
        >
          <ArrowLeft className="size-5 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Back to Store</span>}
          {collapsed && !isMobile && (
            <span className="absolute left-full ml-2 px-2.5 py-1 rounded-lg bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
              Back to Store
            </span>
          )}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full group relative",
            collapsed && !isMobile && "justify-center px-2"
          )}
        >
          <LogOut className="size-5 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
          {collapsed && !isMobile && (
            <span className="absolute left-full ml-2 px-2.5 py-1 rounded-lg bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <div className="fixed top-0 left-0 right-0 z-30 h-14 bg-card/95 backdrop-blur-md border-b flex items-center px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="size-5" />
        </Button>
        <Link href="/admin" className="flex items-center gap-2 font-bold text-base ml-2">
          <Store className="size-4 text-primary" />
          Admin
        </Link>
      </div>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r flex flex-col transition-transform duration-300 ease-out lg:hidden shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card border-r min-h-screen sticky top-0 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
}
