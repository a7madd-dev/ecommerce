"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export function NewsletterSection() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("You're subscribed! Check your inbox.");
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-16 sm:px-16 sm:py-20 text-center">
        {/* Decorative */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-3xl -translate-y-1/2" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 mb-6">
            <Mail className="size-6 text-primary" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Stay in the Loop
          </h2>
          <p className="mt-3 text-white/60 text-lg max-w-md mx-auto">
            Get early access to new drops, exclusive deals, and style inspiration.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              required
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl flex-1"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 px-6 rounded-xl font-semibold"
            >
              Subscribe
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </form>

          <p className="mt-4 text-xs text-white/30">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
