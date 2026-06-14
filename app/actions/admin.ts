"use server";

import { auth } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { productSchema, categorySchema } from "@/lib/validators";
import { createLog } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types";

async function requireRole(...roles: UserRole[]) {
  const session = await auth();
  if (!session?.user || !roles.includes(session.user.role as UserRole)) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createProduct(formData: FormData) {
  const user = await requireRole("admin");
  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    compare_at_price: formData.get("compare_at_price") || null,
    stock: formData.get("stock"),
    image_url: formData.get("image_url") || "",
    category_id: formData.get("category_id"),
    is_active: formData.get("is_active") !== "false",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("products").insert(parsed.data);

  if (error) return { error: { _form: [error.message] } };

  await createLog("Product Created", `"${parsed.data.name}" added`, user.id);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const user = await requireRole("admin");
  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    compare_at_price: formData.get("compare_at_price") || null,
    stock: formData.get("stock"),
    image_url: formData.get("image_url") || "",
    category_id: formData.get("category_id"),
    is_active: formData.get("is_active") !== "false",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: { _form: [error.message] } };

  await createLog("Product Updated", `"${parsed.data.name}" updated`, user.id);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const user = await requireRole("admin");
  const supabase = getServiceClient();

  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("id", id)
    .single();

  // Soft delete
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return { error: error.message };

  await createLog("Product Deleted", `"${product?.name}" deactivated`, user.id);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function createCategory(formData: FormData) {
  await requireRole("admin");
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] || "Invalid" };
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: parsed.data.name })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  return { success: true, id: data.id };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const user = await requireRole("admin", "agent");
  const supabase = getServiceClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { error: error.message };

  await createLog("Order Updated", `Order ${orderId.slice(0, 8)} → ${status}`, user.id);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  const user = await requireRole("admin");
  const supabase = getServiceClient();

  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId);

  if (error) return { error: error.message };

  await createLog("Payment Updated", `Order ${orderId.slice(0, 8)} payment → ${paymentStatus}`, user.id);
  revalidatePath("/admin/orders");
  return { success: true };
}
