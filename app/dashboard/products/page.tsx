import { getServiceClient } from "@/lib/supabase";
import { Product, Category } from "@/types";
import { ProductsTable } from "@/components/admin/products-table";
import { ProductFormModal } from "@/components/admin/product-form-modal";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = getServiceClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <ProductFormModal categories={(categoriesRes.data as Category[]) || []} />
      </div>
      <ProductsTable
        products={(productsRes.data as Product[]) || []}
        categories={(categoriesRes.data as Category[]) || []}
      />
    </div>
  );
}
