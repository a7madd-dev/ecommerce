import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getReviews, getAllReviews, getProducts } from "@/lib/queries";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { RelatedProducts } from "@/components/product/related-products";
import { ProductReviews } from "@/components/product/product-reviews";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(slug);
  let productReviews = await getReviews(product.id);
  if (productReviews.length === 0) {
    productReviews = await getAllReviews(7);
  }

  return (
    <div>
      {/* Section 1: Product Detail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <ProductGallery images={product.images || []} />
          <ProductInfo product={product} />
        </div>
      </section>

      {/* Section 2: Related Products */}
      <RelatedProducts products={related} />

      {/* Section 3: Reviews */}
      <ProductReviews
        reviews={productReviews}
        rating={product.rating}
        reviewCount={product.review_count}
      />
    </div>
  );
}
