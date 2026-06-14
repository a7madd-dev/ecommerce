"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Check,
  X as XIcon,
  Battery,
  Bluetooth,
  Mic,
  Headphones,
  Shield,
  Zap,
  Star,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";
import type { Product, Testimonial } from "@/types";

interface Props {
  product: Product;
  testimonials: Testimonial[];
}

export function StartPageClient({ product, testimonials }: Props) {
  const { addItem } = useCart();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const primaryImage = product.images?.[0]?.url || product.image_url;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: primaryImage,
      stock: product.stock,
    });
  };

  const features = [
    { icon: Battery, title: "35-Hour Battery", desc: "All-day listening with quick charge support. 10 minutes gives you 3 hours." },
    { icon: Bluetooth, title: "Bluetooth 5.3", desc: "Seamless multipoint connection to two devices simultaneously." },
    { icon: Mic, title: "Crystal Clear Calls", desc: "6-microphone array with AI noise reduction for perfect calls." },
    { icon: Headphones, title: "Hi-Res Audio", desc: "LDAC support delivers studio-quality 24-bit/96kHz wireless audio." },
    { icon: Shield, title: "Adaptive ANC", desc: "AI-powered noise cancellation adapts to your environment in real-time." },
    { icon: Zap, title: "Quick Charge", desc: "USB-C fast charging gets you back to full power in under an hour." },
  ];

  const faqs = [
    { q: "How long does shipping take?", a: "Standard shipping takes 3-7 business days. Express shipping (1-2 days) is available at checkout for an additional fee. All orders over $50 ship free." },
    { q: "What is your return policy?", a: "We offer a 30-day hassle-free return policy. If you're not completely satisfied, return the product in its original condition for a full refund. We even cover return shipping." },
    { q: "Does it come with a warranty?", a: "Every pair comes with a 2-year manufacturer warranty covering defects in materials and workmanship. Extended warranty options are available at checkout." },
    { q: "Is it compatible with my device?", a: "Our headphones work with any Bluetooth-enabled device including iPhone, Android, Mac, Windows, tablets, and gaming consoles. They also include a 3.5mm cable for wired connections." },
    { q: "How effective is the noise cancellation?", a: "Our adaptive ANC technology reduces ambient noise by up to 98%. It automatically adjusts based on your environment — whether you're on a plane, in a cafe, or at the office." },
  ];

  const comparison = [
    { feature: "Price", ours: "$299", compA: "$349", compB: "$379" },
    { feature: "Active Noise Cancellation", ours: "Adaptive AI", compA: "Standard", compB: "Adaptive" },
    { feature: "Battery Life", ours: "35 hours", compA: "30 hours", compB: "24 hours" },
    { feature: "Comfort Rating", ours: "9.5/10", compA: "8/10", compB: "8.5/10" },
    { feature: "Warranty", ours: "2 Years", compA: "1 Year", compB: "1 Year" },
  ];

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="text-sm px-4 py-1.5">
                Limited Time — Save $50
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Silence the World.{" "}
                <span className="text-primary">Hear What Matters.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Premium wireless headphones with adaptive noise cancellation,
                35-hour battery life, and studio-quality sound. Designed for
                those who refuse to compromise.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold">${product.price}</span>
                {product.compare_at_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.compare_at_price}
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="text-base h-14 px-8 rounded-xl"
                  onClick={handleAdd}
                >
                  Order Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base h-14 px-8 rounded-xl"
                  onClick={() =>
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-green-500" /> Free Shipping
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-green-500" /> 30-Day Returns
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-green-500" /> 2-Year Warranty
                </span>
              </div>
            </div>
            <div className="relative aspect-square max-w-lg mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl" />
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover rounded-3xl"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Tired of...</h2>
              <div className="space-y-4">
                {[
                  "Distracting background noise ruining your focus",
                  "Headphones that die before your workday ends",
                  "Uncomfortable ear cups that hurt after an hour",
                  "Muffled audio quality on calls",
                ].map((pain) => (
                  <div key={pain} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XIcon className="size-3.5 text-red-500" />
                    </div>
                    <p className="text-muted-foreground">{pain}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">
                With {product.name}...
              </h2>
              <div className="space-y-4">
                {[
                  "Adaptive ANC blocks 98% of ambient noise instantly",
                  "35 hours of non-stop playback on a single charge",
                  "Memory foam cushions designed for all-day comfort",
                  "6-mic array delivers crystal-clear call quality",
                ].map((solution) => (
                  <div key={solution} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="size-3.5 text-green-600" />
                    </div>
                    <p className="text-muted-foreground">{solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Engineered for Excellence</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Every detail has been meticulously crafted to deliver an
              unparalleled audio experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feat.icon className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            {[
              { label: "Units Sold", value: "10,000+" },
              { label: "Average Rating", value: "4.8/5" },
              { label: "Money-Back Guarantee", value: "30 Days" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-card border rounded-2xl p-6 space-y-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            How We Compare
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 pr-4 text-sm font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="py-4 px-4 text-sm font-bold bg-primary/5 rounded-t-xl">
                    Ours
                  </th>
                  <th className="py-4 px-4 text-sm font-medium text-muted-foreground">
                    Competitor A
                  </th>
                  <th className="py-4 px-4 text-sm font-medium text-muted-foreground">
                    Competitor B
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b">
                    <td className="py-4 pr-4 text-sm font-medium">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-sm text-center font-semibold text-primary bg-primary/5">
                      {row.ours}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-muted-foreground">
                      {row.compA}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-muted-foreground">
                      {row.compB}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-card border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  {faq.q}
                  <ChevronDown
                    className={cn(
                      "size-4 flex-shrink-0 ml-4 transition-transform duration-200",
                      openFaq === i && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-200",
                    openFaq === i
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Transform Your Audio?
          </h2>
          <p className="text-lg opacity-90 max-w-xl mx-auto">
            Join 10,000+ happy customers who made the switch. Order today and
            experience the difference.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-base h-14 px-10 rounded-xl"
            onClick={handleAdd}
          >
            Add to Cart — ${product.price}
          </Button>
          <p className="text-sm opacity-70">
            30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </section>

      {/* Sticky Buy Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t py-3 px-4 transition-transform duration-300",
          showStickyBar ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{product.name}</p>
              <p className="text-sm text-primary font-bold">
                ${product.price}
              </p>
            </div>
          </div>
          <Button className="rounded-xl flex-shrink-0" onClick={handleAdd}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
