import { getServiceClient } from "@/lib/supabase";
import { getFeaturedProducts } from "@/lib/queries";
import { Product, Category } from "@/types";
import { ProductGrid } from "@/components/shop/product-grid";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProductsSection } from "@/components/home/featured-products-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { NewsletterSection } from "@/components/home/newsletter-section";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const hasFilters = params.q || params.category || params.sort;

  // If user is searching/filtering, show product grid
  if (hasFilters) {
    return <FilteredView params={params} />;
  }

  // Otherwise show the full premium homepage
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection products={featuredProducts} />
      <PromoBanner />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}

async function FilteredView({
  params,
}: {
  params: { q?: string; category?: string; sort?: string };
}) {
  const supabase = getServiceClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  let query = supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true);

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  if (params.category) {
    query = query.eq("category_id", params.category);
  }

  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name");
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="mt-1 text-muted-foreground">Browse our collection</p>
      </div>
      <ProductGrid
        products={(products as Product[]) || []}
        categories={(categories as Category[]) || []}
        initialSearch={params.q || ""}
        initialCategory={params.category || ""}
        initialSort={params.sort || ""}
      />
    </div>
  );
}
