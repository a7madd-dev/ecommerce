"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin",
  agent: "/admin/orders",
  client: "/",
  guest: "/",
};

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid email or password");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role || "client";
    const dest = ROLE_REDIRECTS[role] || "/";

    toast.success("Welcome back!");
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="bg-card p-8 rounded-2xl shadow-sm border">
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Store className="size-6 text-primary" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-center mb-1">Welcome back</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Sign in to your account
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Password</label>
          <Input
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground text-center mt-6">
        Contact your administrator if you need access.
      </p>
    </div>
  );
}
