"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart/cart-context";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Minus,
  Plus,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";
import type { Product } from "@/types";

export function FeaturedProductsSection({ products }: { products: Product[] }) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Featured Products
          </h2>
          <p className="mt-2 text-muted-foreground">Handpicked by our team</p>
        </div>
        <Button variant="outline" className="hidden sm:flex rounded-xl">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <FeaturedCard
            key={product.id}
            product={product}
            onQuickView={setQuickViewProduct}
          />
        ))}
      </div>

      <FeaturedQuickView
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}

function FeaturedCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: (p: Product) => void;
}) {
  const { addItem } = useCart();
  const imageUrl = product.images?.[0]?.url || product.image_url;
  const discount = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.price) / product.compare_at_price) * 100
      )
    : null;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: imageUrl,
      stock: product.stock,
    });
  }

  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => onQuickView(product)}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] font-semibold px-2 py-0.5">
              {product.badge}
            </Badge>
          )}
          {discount && (
            <Badge
              variant="destructive"
              className="text-[10px] font-semibold px-2 py-0.5"
            >
              -{discount}%
            </Badge>
          )}
        </div>

        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <Heart className="size-4 text-foreground" />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <Button
            className="flex-1 rounded-xl h-10 text-sm font-medium shadow-lg"
            onClick={handleAdd}
          >
            <ShoppingCart className="size-4 mr-1.5" />
            Add
          </Button>
          <Button
            variant="secondary"
            className="rounded-xl h-10 px-3 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
          >
            <Eye className="size-4" />
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs text-primary font-medium uppercase tracking-wider">
          {product.category?.name}
        </p>
        <h3 className="font-semibold text-foreground mt-1 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3 ${
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.review_count.toLocaleString()})
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.compare_at_price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedQuickView({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const imageUrl = product.images?.[0]?.url || product.image_url;
  const discount = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.price) / product.compare_at_price) * 100
      )
    : null;

  function handleAdd() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product!.id,
        name: product!.name,
        price: product!.price,
        image_url: imageUrl,
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
          <div className="relative aspect-square bg-muted">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
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

          <div className="p-6 md:p-8 flex flex-col">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
              {product.category?.name}
            </p>
            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.review_count.toLocaleString()} reviews)
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold">
                ${product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>

            <Separator className="my-5" />

            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              {product.description}
            </p>

            <p className="text-sm text-green-600 font-medium mt-4">
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>

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
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-r-xl"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <Button
                className="flex-1 h-11 rounded-xl font-semibold"
                onClick={handleAdd}
              >
                <ShoppingCart className="size-4 mr-2" />
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </Button>
            </div>

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
