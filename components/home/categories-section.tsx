import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/queries";

export async function CategoriesSection() {
  const categories = await getCategories();
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
        <p className="mt-2 text-muted-foreground">
          Find exactly what you&apos;re looking for
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/?category=${encodeURIComponent(category.name)}`}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-muted"
          >
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-semibold text-sm">{category.name}</h3>
              <p className="text-white/70 text-xs mt-0.5">{category.item_count} items</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
