"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { mediaUrl } from "@/lib/media-url";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import type { IGalleryItem } from "@/models/GalleryItem";

export function GallerySection({ items }: { items: IGalleryItem[] }) {
  const [active, setActive] = useState<string>("All");

  if (!items.length) return null;

  const categories = ["All", ...GALLERY_CATEGORIES.filter((c) => items.some((i) => i.category === c))];
  const filtered = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading eyebrow="Our Work" title="Recent Projects Gallery" />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                active === cat
                  ? "bg-brand-red text-white"
                  : "bg-brand-gray-50 text-brand-gray-600 hover:bg-brand-gray-200"
              }`}
              aria-pressed={active === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const img = mediaUrl(item.imageMediaId?.toString()) || "/image-fallback.jpg";
            return (
              <div
                key={item._id.toString()}
                className="group relative aspect-square overflow-hidden rounded-lg bg-brand-gray-50"
              >
                <Image
                  src={img}
                  alt={item.title || item.category}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="p-3 text-xs font-semibold text-white">
                    {item.title || item.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
