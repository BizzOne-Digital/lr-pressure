import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { mediaUrl } from "@/lib/media-url";
import type { HomeContent } from "@/lib/content-schemas";
import type { IGalleryItem } from "@/models/GalleryItem";

interface BeforeAfterProps {
  section: HomeContent["beforeAfter"];
  items: IGalleryItem[];
}

export function BeforeAfter({ section, items }: BeforeAfterProps) {
  if (!items.length) return null;

  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Real Results"
          title={section.heading || "See The Difference For Yourself"}
          description={
            section.description ||
            "A clean exterior makes an immediate impact. Here's a look at the kind of results our process delivers."
          }
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((item, i) => {
            const img = mediaUrl(item.imageMediaId?.toString()) || "/image-fallback.jpg";
            return (
              <Reveal key={item._id.toString()} delay={i * 0.07}>
                <figure className="group overflow-hidden rounded-lg bg-white shadow-md shadow-black/5">
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={img}
                      alt={item.title || "Before and after exterior cleaning result"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  {(item.title || item.caption) && (
                    <figcaption className="p-4">
                      {item.title && (
                        <p className="font-heading text-sm font-bold text-brand-black">
                          {item.title}
                        </p>
                      )}
                      {item.caption && (
                        <p className="mt-1 text-xs text-brand-gray-600">{item.caption}</p>
                      )}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
