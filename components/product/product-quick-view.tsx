"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart/cart-context";
import {
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Heart,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";
import Image from "next/image";
import type { Product } from "@/types";

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, open, onClose }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const outOfStock = product.stock <= 0;
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) /
            product.compare_at_price) *
            100
        )
      : null;

  function handleAdd() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product!.id,
        name: product!.name,
        price: Number(product!.price),
        image_url: product!.image_url,
        stock: product!.stock,
      });
    }
    setQuantity(1);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setQuantity(1);
        }
      }}
    >
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-2xl gap-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="size-16 text-muted-foreground/20" />
              </div>
            )}

            {discount && (
              <Badge
                variant="destructive"
                className="absolute top-4 left-4 text-xs font-semibold px-2.5 py-1"
              >
                -{discount}% OFF
              </Badge>
            )}

            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <Heart className="size-5 text-foreground" />
            </button>
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            {product.category && (
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                {product.category.name}
              </p>
            )}

            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              {product.name}
            </h2>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < 4
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                4.0 (128 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${Number(product.compare_at_price).toFixed(2)}
                </span>
              )}
            </div>

            <Separator className="my-5" />

            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              {product.description}
            </p>

            {/* Stock status */}
            <div className="mt-4">
              {outOfStock ? (
                <p className="text-sm text-destructive font-medium">
                  Out of Stock
                </p>
              ) : product.stock <= 10 ? (
                <p className="text-sm text-amber-600 font-medium">
                  Only {product.stock} left in stock
                </p>
              ) : (
                <p className="text-sm text-green-600 font-medium">In Stock</p>
              )}
            </div>

            {/* Quantity + Add */}
            {!outOfStock && (
              <div className="flex items-center gap-3 mt-5">
                <div className="flex items-center border rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-l-xl"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-r-xl disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Button
                  className="flex-1 h-11 rounded-xl font-semibold"
                  onClick={handleAdd}
                >
                  <ShoppingCart className="size-4 mr-2" />
                  Add to Cart — ${(Number(product.price) * quantity).toFixed(2)}
                </Button>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: RotateCcw, label: "Easy Returns" },
                { icon: Shield, label: "Secure Payment" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
