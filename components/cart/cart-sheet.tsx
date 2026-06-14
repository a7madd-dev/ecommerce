"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "./cart-context";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";

export function CartSheet() {
  const {
    items,
    itemCount,
    total,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="flex items-center justify-between">
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <ShoppingBag className="size-8 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add some products to get started
              </p>
            </div>
            <Button
              variant="outline"
              onClick={closeCart}
              className="rounded-xl"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.product_id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-5 space-y-4 bg-background">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-2xl font-bold tracking-tight">
                  ${total.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping calculated at checkout
              </p>
              <Button
                className="w-full h-12 rounded-xl text-base font-semibold"
                onClick={openCheckout}
              >
                Checkout
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
    stock: number;
  };
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex gap-4 group">
      <div className="relative w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="size-6 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium leading-tight line-clamp-2">
            {item.name}
          </h4>
          <button
            onClick={() => onRemove(item.product_id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md flex-shrink-0"
          >
            <Trash2 className="size-3.5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-sm font-semibold mt-1">
          ${(item.price * item.quantity).toFixed(2)}
        </p>

        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={() =>
              onUpdateQuantity(item.product_id, item.quantity - 1)
            }
            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <Minus className="size-3" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={() =>
              onUpdateQuantity(item.product_id, item.quantity + 1)
            }
            disabled={item.quantity >= item.stock}
            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors disabled:opacity-40"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
