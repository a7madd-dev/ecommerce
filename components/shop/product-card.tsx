"use client";

import { Product } from "@/types";
import { ShoppingCart, Heart, Star } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { addToCart } from "@/app/actions/cart";

export function ProductCard({ product }: { product: Product }) {
  async function handleAdd() {
    const result = await addToCart({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      stock: product.stock,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Added to cart");
    }
  }

  const outOfStock = product.stock <= 0;
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        )
      : null;

  return (
    <div className="group relative">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <ShoppingCart className="size-12" />
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-foreground text-sm font-medium px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {discount && !outOfStock && (
          <Badge variant="destructive" className="absolute top-3 left-3 text-[10px] font-semibold">
            -{discount}%
          </Badge>
        )}

        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
          <Heart className="size-4 text-foreground" />
        </button>

        {!outOfStock && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <Button onClick={handleAdd} className="w-full rounded-xl h-10 text-sm font-medium">
              <ShoppingCart className="size-4 mr-1.5" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      <div>
        {product.category && (
          <p className="text-xs text-primary font-medium uppercase tracking-wider">
            {product.category.name}
          </p>
        )}
        <h3 className="font-semibold text-foreground mt-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-foreground">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              ${Number(product.compare_at_price).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
