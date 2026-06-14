"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  Heart,
  Store,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Package,
  Flame,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/components/cart/cart-context";
import type { UserRole } from "@/types";

interface HeaderUser {
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
}

const navLinks = [
  { href: "/store", label: "Store", icon: Package },
  { href: "/start", label: "Deals", icon: Flame },
  { href: "/store", label: "New Arrivals", icon: Sparkles },
];

function getDashboardLink(role: UserRole) {
  switch (role) {
    case "admin":
      return { href: "/admin", label: "Admin Panel", icon: ShieldCheck };
    case "agent":
      return { href: "/admin/orders", label: "Dashboard", icon: LayoutDashboard };
    default:
      return { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard };
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  const dashboardLink = user ? getDashboardLink(user.role) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <Store className="size-5 text-primary" />
            <span>Store</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="size-5" />
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Heart className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCart}
          >
            <ShoppingCart className="size-5" />
            <span
              className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200 ${
                itemCount > 0 ? "scale-100" : "scale-0"
              }`}
            >
              {itemCount}
            </span>
          </Button>

          {/* Desktop User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                {user ? (
                  <Avatar className="size-7">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="size-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
              {user ? (
                <>
                  <DropdownMenuLabel className="font-normal px-3 py-2">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {dashboardLink && (
                    <DropdownMenuItem asChild className="rounded-lg gap-2 cursor-pointer">
                      <Link href={dashboardLink.href}>
                        <dashboardLink.icon className="size-4" />
                        {dashboardLink.label}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-lg gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild className="rounded-lg gap-2 cursor-pointer">
                  <Link href="/login">
                    <User className="size-4" />
                    Sign In
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-0" showCloseButton={false}>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              {/* Mobile menu header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  <Store className="size-5 text-primary" />
                  Store
                </Link>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <X className="size-4" />
                  </Button>
                </SheetClose>
              </div>

              {/* User section */}
              {user && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      {user.image && <AvatarImage src={user.image} alt={user.name} />}
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <nav className="p-3 flex-1">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors group"
                    >
                      <link.icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      {link.label}
                      <ChevronRight className="size-4 text-muted-foreground/40 ml-auto" />
                    </Link>
                  ))}
                </div>

                <div className="my-3 border-t" />

                <div className="space-y-1">
                  <Link
                    href="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors group"
                  >
                    <ShoppingCart className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    Cart
                    {itemCount > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors group"
                  >
                    <Heart className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    Wishlist
                  </Link>
                </div>
              </nav>

              {/* Bottom auth section */}
              <div className="mt-auto p-4 border-t">
                {user ? (
                  <div className="space-y-2">
                    {dashboardLink && (
                      <Button
                        asChild
                        className="w-full rounded-xl justify-start gap-2"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Link href={dashboardLink.href}>
                          <dashboardLink.icon className="size-4" />
                          {dashboardLink.label}
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full rounded-xl justify-start gap-2 text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    asChild
                    className="w-full rounded-xl"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link href="/login">
                      <User className="size-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Expand */}
      {searchOpen && (
        <div className="lg:hidden border-t px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 bg-muted/50 border-0"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
