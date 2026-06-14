import { getProducts } from "@/lib/queries";
import { AdminProductsClient } from "./products-client";

export default async function AdminProductsPage() {
  const products = await getProducts();
  return <AdminProductsClient products={products} />;
}
