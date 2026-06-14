"use server";

import { getCart, clearCart } from "@/lib/cart";
import { getServiceClient } from "@/lib/supabase";
import { checkoutSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";

export async function processCheckout(data: {
  name: string;
  phone: string;
  address: string;
}) {
  const parsed = checkoutSchema.safeParse(data);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return { error: firstError || "Invalid input" };
  }

  const cart = await getCart();
  if (cart.length === 0) {
    return { error: "Cart is empty" };
  }

  const supabase = getServiceClient();

  const session = await auth();
  const userId = session?.user?.id || null;

  // Re-validate stock for every item
  for (const item of cart) {
    const { data: product } = await supabase
      .from("products")
      .select("id, name, stock, is_active")
      .eq("id", item.product_id)
      .single();

    if (!product || !product.is_active) {
      return { error: `Product "${item.name}" is no longer available` };
    }
    if (product.stock < item.quantity) {
      return {
        error: `"${product.name}" only has ${product.stock} in stock (you requested ${item.quantity})`,
      };
    }
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      customer_name: parsed.data.name,
      customer_phone: parsed.data.phone,
      customer_address: parsed.data.address,
      total,
      status: "pending",
      payment_status: "unpaid",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "Failed to create order. Please try again." };
  }

  for (const item of cart) {
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    });

    const { error: stockError } = await supabase.rpc("decrement_stock", {
      p_id: item.product_id,
      qty: item.quantity,
    });

    if (stockError) {
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id);
      return {
        error: `Stock issue with "${item.name}". Order cancelled.`,
      };
    }
  }

  await clearCart();

  return { success: true, orderId: order.id };
}
