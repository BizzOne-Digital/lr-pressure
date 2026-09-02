"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { mediaUrl } from "@/lib/media-url";
import { GALLERY_CATEGORIES } from "@/lib/constants";

// Plain, JSON-serializable shape only — this is a Client Component, so it
// cannot receive raw Mongoose/lean() documents as props (their ObjectId and
// Date fields aren't plain objects). The Server Component that renders this
// must map query results into this shape first; see toGalleryCardItem() in
// src/lib/data.ts.
export interface GalleryCardItem {
  _id: string;
  title: string;
  caption: string;
  category: string;
  imageMediaId?: string;
}

export function GallerySection({ items }: { items: GalleryCardItem[] }) {
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
            const img = mediaUrl(item.imageMediaId) || "/image-fallback.jpg";
            return (
              <div
                key={item._id}
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

        <div className="mt-10 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-red hover:underline"
          >
            View Full Gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
