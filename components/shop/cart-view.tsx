"use client";

import { CartItem } from "@/types";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { updateCartItem, removeCartItem } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export function CartView({ items }: { items: CartItem[] }) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="size-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Link href="/">
          <Button className="rounded-xl">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleQuantity(productId: string, qty: number) {
    const result = await updateCartItem(productId, qty);
    if (result.error) {
      toast.error(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleRemove(productId: string) {
    await removeCartItem(productId);
    toast.success("Removed from cart");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.product_id}
          className="flex gap-4 p-4 bg-card rounded-2xl border shadow-sm"
        >
          <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 relative">
            {item.image_url ? (
              <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <ShoppingBag className="size-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => handleQuantity(item.product_id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => handleQuantity(item.product_id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                <Plus className="size-4" />
              </button>
              <button
                onClick={() => handleRemove(item.product_id)}
                className="ml-auto w-8 h-8 rounded-lg text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      ))}

      <Separator className="my-6" />

      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold">${total.toFixed(2)}</span>
      </div>
      <div className="flex gap-3">
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full rounded-xl">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/checkout" className="flex-1">
          <Button className="w-full rounded-xl">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
