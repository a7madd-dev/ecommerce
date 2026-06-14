"use server";

import { getCart, setCart } from "@/lib/cart";
import { getServiceClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface AddToCartInput {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
}

export async function addToCart(
  productIdOrInput: string | AddToCartInput,
  quantity?: number
) {
  let productId: string;
  let qty: number;
  let name: string;
  let price: number;
  let image_url: string;
  let stock: number;

  if (typeof productIdOrInput === "object") {
    // New signature: full product data passed from client
    productId = productIdOrInput.productId;
    qty = productIdOrInput.quantity;
    name = productIdOrInput.name;
    price = productIdOrInput.price;
    image_url = productIdOrInput.image_url;
    stock = productIdOrInput.stock;
  } else {
    // Legacy signature: lookup from DB
    productId = productIdOrInput;
    qty = quantity ?? 1;

    const supabase = getServiceClient();
    const { data: product } = await supabase
      .from("products")
      .select("id, name, price, stock, image_url")
      .eq("id", productId)
      .single();

    if (!product) return { error: "Product not found" };
    name = product.name;
    price = Number(product.price);
    image_url = product.image_url;
    stock = product.stock;
  }

  const cart = await getCart();
  const existing = cart.find((item) => item.product_id === productId);
  const currentQty = existing ? existing.quantity : 0;

  if (currentQty + qty > stock) {
    return { error: `Only ${stock - currentQty} more available` };
  }

  if (existing) {
    existing.quantity += qty;
    existing.stock = stock;
  } else {
    cart.push({
      product_id: productId,
      name,
      price,
      quantity: qty,
      image_url,
      stock,
    });
  }

  await setCart(cart);
  revalidatePath("/");
  return { success: true };
}

export async function updateCartItem(productId: string, quantity: number) {
  const cart = await getCart();
  const item = cart.find((i) => i.product_id === productId);
  if (!item) return { error: "Item not in cart" };

  if (quantity <= 0) {
    const filtered = cart.filter((i) => i.product_id !== productId);
    await setCart(filtered);
  } else {
    if (quantity > item.stock) {
      return { error: `Only ${item.stock} available` };
    }
    item.quantity = quantity;
    await setCart(cart);
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeCartItem(productId: string) {
  const cart = await getCart();
  const filtered = cart.filter((i) => i.product_id !== productId);
  await setCart(filtered);
  revalidatePath("/cart");
  return { success: true };
}
