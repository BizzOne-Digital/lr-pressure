import Image from "next/image";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { mediaUrl } from "@/lib/media-url";
import type { ITestimonial } from "@/models/Testimonial";

export function Testimonials({ items }: { items: ITestimonial[] }) {
  if (!items.length) return null;

  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading eyebrow="Customer Feedback" title="What Our Customers Say" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((t, i) => {
            const photo = mediaUrl(t.photoMediaId?.toString());
            return (
              <Reveal key={t._id.toString()} delay={i * 0.07}>
                <div className="flex h-full flex-col rounded-lg bg-white p-7 shadow-md shadow-black/5">
                  <div className="flex gap-0.5 text-brand-red">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="h-4 w-4"
                        fill={idx < t.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-gray-800">
                    &ldquo;{t.testimonialText}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={t.customerName}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-black text-sm font-bold text-white">
                        {t.customerName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-brand-black">{t.customerName}</p>
                      {t.location && (
                        <p className="text-xs text-brand-gray-600">{t.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
