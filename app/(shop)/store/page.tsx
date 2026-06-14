import { getProducts, getCategories } from "@/lib/queries";
import { StorePageClient } from "@/components/store/store-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Store — Browse All Products",
  description: "Browse our full collection of premium products",
};

export default async function StorePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <StorePageClient products={products} categories={categories} />;
}
