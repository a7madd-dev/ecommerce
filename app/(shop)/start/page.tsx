import { getProductBySlug, getTestimonials } from "@/lib/queries";
import { notFound } from "next/navigation";
import { StartPageClient } from "./start-page-client";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const product = await getProductBySlug("wireless-anc-headphones");
  if (!product) notFound();

  const testimonials = await getTestimonials();

  return <StartPageClient product={product} testimonials={testimonials} />;
}
