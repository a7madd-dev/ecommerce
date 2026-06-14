import { getServiceClient } from "@/lib/supabase";
import type {
  Product,
  Category,
  Review,
  Campaign,
  Customer,
  AnalyticsData,
  Testimonial,
} from "@/types";

function db() {
  return getServiceClient();
}

// ─── Products ──────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await db()
    .from("products")
    .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Product[]) || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await db()
    .from("products")
    .select("*, category:categories(*), images:product_images(*, sort_order), variants:product_variants(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;
  // Sort images by sort_order
  if (data.images) {
    (data.images as Product["images"])?.sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    );
  }
  return data as Product;
}

export async function getRelatedProducts(
  slug: string,
  limit = 6
): Promise<Product[]> {
  // Get the product's category first
  const product = await getProductBySlug(slug);
  if (!product) return [];

  const { data, error } = await db()
    .from("products")
    .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
    .eq("is_active", true)
    .eq("category_id", product.category_id)
    .neq("slug", slug)
    .limit(limit);
  if (error) throw error;

  // If not enough in same category, fill with other products
  let results = (data as Product[]) || [];
  if (results.length < limit) {
    const { data: more } = await db()
      .from("products")
      .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
      .eq("is_active", true)
      .neq("slug", slug)
      .not("id", "in", `(${results.map((r) => r.id).join(",")})`)
      .limit(limit - results.length);
    if (more) results = [...results, ...(more as Product[])];
  }
  return results;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await db()
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .eq("is_active", true)
    .order("rating", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Product[]) || [];
}

// ─── Categories ────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await db()
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data as Category[]) || [];
}

// ─── Reviews ───────────────────────────────────────────────

export async function getReviews(productId: string): Promise<Review[]> {
  const { data, error } = await db()
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Review[]) || [];
}

export async function getAllReviews(limit = 7): Promise<Review[]> {
  const { data, error } = await db()
    .from("reviews")
    .select("*")
    .order("helpful", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Review[]) || [];
}

// ─── Campaigns ─────────────────────────────────────────────

export async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await db()
    .from("campaigns")
    .select("*, daily_stats:campaign_daily_stats(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Campaign[]) || [];
}

// ─── Analytics ─────────────────────────────────────────────

export async function getAnalytics(days = 30): Promise<AnalyticsData[]> {
  const { data, error } = await db()
    .from("daily_analytics")
    .select("*")
    .order("date", { ascending: true })
    .limit(days);
  if (error) throw error;
  return (data as AnalyticsData[]) || [];
}

// ─── Customers ─────────────────────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await db()
    .from("customers")
    .select("*")
    .order("total_spent", { ascending: false });
  if (error) throw error;
  return (data as Customer[]) || [];
}

// ─── Testimonials ──────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await db()
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Testimonial[]) || [];
}
