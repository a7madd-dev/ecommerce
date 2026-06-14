"use client";

import { Product } from "@/types";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";

interface Props {
  product: Product;
  onQuickView: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: Props) {
  const { addItem } = useCart();

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      stock: product.stock,
    });
  }

  const outOfStock = product.stock <= 0;
  const discount =
    product.compare_at_price &&
    Number(product.compare_at_price) > Number(product.price)
      ? Math.round(
          ((Number(product.compare_at_price) - Number(product.price)) /
            Number(product.compare_at_price)) *
            100
        )
      : null;

  return (
    <div className="group relative cursor-pointer" onClick={() => onQuickView(product)}>
      {/* Image */}
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

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && !outOfStock && (
            <Badge
              variant="destructive"
              className="text-[10px] font-semibold px-2 py-0.5"
            >
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <Heart className="size-4 text-foreground" />
        </button>

        {/* Action overlay */}
        {!outOfStock && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <Button
              onClick={handleAdd}
              className="flex-1 rounded-xl h-10 text-sm font-medium shadow-lg"
            >
              <ShoppingCart className="size-4 mr-1.5" />
              Add
            </Button>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="rounded-xl h-10 px-3 shadow-lg"
            >
              <Eye className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {product.category && (
          <p className="text-xs text-primary font-medium uppercase tracking-wider">
            {product.category.name}
          </p>
        )}
        <h3 className="font-semibold text-foreground mt-1 line-clamp-1 group-hover:text-primary transition-colors">
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
