import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="size-3.5" />
            New Collection 2026
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Designed for
            <span className="block text-primary">how you live.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Curated essentials that blend form and function. Premium quality,
            thoughtful design, delivered to your door.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link href="/">
              <Button size="lg" className="text-base px-8 h-12 rounded-xl">
                Shop Now
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
            <Link href="/?sort=">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-12 rounded-xl"
              >
                Explore New Arrivals
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-border/50">
            {[
              { value: "10K+", label: "Happy Customers" },
              { value: "500+", label: "Products" },
              { value: "4.9", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
