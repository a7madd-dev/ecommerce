"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface Props {
  images: ProductImage[];
}

export function ProductGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted group cursor-zoom-in">
        <Image
          key={activeImage.id}
          src={activeImage.url}
          alt={activeImage.alt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          priority
          unoptimized
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0",
              i === activeIndex
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-muted-foreground/30"
            )}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>
    </div>
  );
}
