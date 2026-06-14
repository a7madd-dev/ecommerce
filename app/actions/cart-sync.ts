"use server";

import { getCart, clearCart } from "@/lib/cart";
import type { CartItem } from "@/types";

export async function syncCart(): Promise<CartItem[]> {
  return getCart();
}

export async function serverClearCart() {
  await clearCart();
}
