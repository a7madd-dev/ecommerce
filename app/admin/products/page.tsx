import { getProducts } from "@/lib/queries";
import { AdminProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();
  return <AdminProductsClient products={products} />;
}
