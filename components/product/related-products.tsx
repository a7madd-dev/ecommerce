"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Minus, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import type { Product } from "@/types";

interface Props {
  products: Product[];
}

export function RelatedProducts({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addItem } = useCart();

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const getQty = (id: string) => quantities[id] ?? 1;

  const setQty = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, Math.min(10, val)) }));
  };

  const handleAdd = (product: Product) => {
    const qty = getQty(product.id);
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.images?.[0]?.url || product.image_url,
        stock: product.stock,
      });
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">You May Also Like</h2>
          <div className="hidden sm:flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll("left")}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll("right")}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] snap-start group"
            >
              <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link href={`/product/${product.slug}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.images?.[0]?.url || product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                </Link>
                <div className="p-4 space-y-3">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold truncate hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">${product.price.toFixed(2)}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQty(product.id, getQty(product.id) - 1)}
                        className="p-1.5 hover:bg-muted transition-colors"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {getQty(product.id)}
                      </span>
                      <button
                        onClick={() => setQty(product.id, getQty(product.id) + 1)}
                        className="p-1.5 hover:bg-muted transition-colors"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <Button
                      size="sm"
                      className="flex-1 rounded-lg"
                      onClick={() => handleAdd(product)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Discover Our Full Collection</h3>
            <p className="text-muted-foreground mt-1">
              Browse hundreds of premium products curated for you
            </p>
          </div>
          <Button asChild className="rounded-xl gap-2">
            <Link href="/store">
              Shop All <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
