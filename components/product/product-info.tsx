"use client";

import { useState } from "react";
import {
  Star,
  Heart,
  Minus,
  Plus,
  ChevronDown,
  Shield,
  Truck,
  RotateCcw,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
  product: Product;
}

export function ProductInfo({ product }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    (product.variants || []).forEach((v) => {
      defaults[v.id] = v.options[0];
    });
    return defaults;
  });
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.images?.[0]?.url || product.image_url,
        stock: product.stock,
      });
    }
  };

  const trustBadges = [
    { icon: Shield, label: "Secure Checkout" },
    { icon: Truck, label: "Free Shipping" },
    { icon: RotateCcw, label: "Easy Returns" },
    { icon: Award, label: "Quality Guarantee" },
  ];

  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-4",
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.rating} ({product.review_count.toLocaleString()} reviews)
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
        {product.compare_at_price && (
          <span className="text-lg text-muted-foreground line-through">
            ${product.compare_at_price.toFixed(2)}
          </span>
        )}
        {discount && (
          <Badge className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/10">
            {discount}% OFF
          </Badge>
        )}
      </div>

      <Separator />

      {/* Variants */}
      {(product.variants || []).map((variant) => (
        <div key={variant.id}>
          <p className="text-sm font-medium mb-2">
            {variant.name}: <span className="text-muted-foreground">{selectedVariants[variant.id]}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => (
              <button
                key={option}
                onClick={() =>
                  setSelectedVariants((prev) => ({ ...prev, [variant.id]: option }))
                }
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200",
                  selectedVariants[variant.id] === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50 bg-background"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity */}
      <div>
        <p className="text-sm font-medium mb-2">Quantity</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-r-none"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-l-none"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            {product.stock} available
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full text-base h-12 rounded-xl" onClick={handleAddToCart}>
          Add to Cart
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-12 rounded-xl"
          >
            Buy Now
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl"
            onClick={() => setWishlisted(!wishlisted)}
          >
            <Heart
              className={cn(
                "size-5 transition-colors",
                wishlisted ? "fill-red-500 text-red-500" : ""
              )}
            />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Accordions */}
      {[
        {
          id: "shipping",
          title: "Shipping & Returns",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Free standard shipping on orders over $50. Express shipping available at checkout.</p>
              <p>30-day hassle-free returns. Items must be in original condition with tags attached.</p>
              <p>Estimated delivery: 3-7 business days (standard), 1-2 business days (express).</p>
            </div>
          ),
        },
        {
          id: "details",
          title: "Product Details",
          content: (
            <div className="space-y-2">
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          ),
        },
      ].map((section) => (
        <div key={section.id} className="border rounded-xl overflow-hidden">
          <button
            onClick={() =>
              setOpenAccordion(openAccordion === section.id ? null : section.id)
            }
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            {section.title}
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                openAccordion === section.id && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "grid transition-all duration-200",
              openAccordion === section.id
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4">{section.content}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-3">
        {trustBadges.map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-sm"
          >
            <badge.icon className="size-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
