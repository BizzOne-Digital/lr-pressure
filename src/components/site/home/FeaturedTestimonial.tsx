import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { mediaUrl } from "@/lib/media-url";
import type { ITestimonial } from "@/models/Testimonial";

export function FeaturedTestimonial({ testimonial }: { testimonial: ITestimonial | null }) {
  if (!testimonial) return null;
  const photo = mediaUrl(testimonial.photoMediaId?.toString());

  return (
    <section className="relative overflow-hidden bg-brand-black py-20 lg:py-28">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-red/10 blur-3xl" />
      <div className="container-lux relative max-w-3xl text-center">
        <Quote className="mx-auto h-10 w-10 text-brand-red" aria-hidden="true" />
        <div className="mt-4 flex justify-center gap-1 text-brand-red">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} className="h-5 w-5" fill={idx < testimonial.rating ? "currentColor" : "none"} />
          ))}
        </div>
        <p className="mt-6 text-balance font-heading text-xl font-semibold leading-relaxed text-white sm:text-2xl">
          &ldquo;{testimonial.testimonialText}&rdquo;
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          {photo ? (
            <Image
              src={photo}
              alt={testimonial.customerName}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red text-sm font-bold text-white">
              {testimonial.customerName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-bold text-white">{testimonial.customerName}</p>
            {testimonial.location && <p className="text-xs text-white/50">{testimonial.location}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
