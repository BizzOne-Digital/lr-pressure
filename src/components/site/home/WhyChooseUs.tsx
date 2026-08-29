import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { mediaUrl } from "@/lib/media-url";
import type { HomeContent } from "@/lib/content-schemas";

export function WhyChooseUs({ section }: { section: HomeContent["whyChooseUs"] }) {
  const img = mediaUrl(section.imageMediaId) || "/image-fallback.jpg";
  const points = section.points?.length
    ? section.points
    : [
        "Reliable, on-time service",
        "Affordable, transparent pricing",
        "Professional results, every time",
        "Careful attention to every detail",
      ];

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-lux grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal direction="none">
          <div className="relative h-80 overflow-hidden rounded-lg shadow-2xl shadow-black/10 sm:h-[26rem] lg:h-[32rem]">
            <Image
              src={img}
              alt="LR Pressure Washing at work"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            <span className="h-px w-6 bg-brand-red" />
            Our Mission
          </div>
          <h2 className="text-balance font-heading text-3xl font-bold leading-tight text-brand-black sm:text-4xl">
            {section.heading || "Why Choose LR Pressure Washing"}
          </h2>
          <p className="mt-5 text-balance leading-relaxed text-brand-gray-600">
            {section.content ||
              "Our mission is to provide reliable, affordable, and professional pressure washing and exterior care services that consistently exceed customer expectations. We build long-term relationships with our clients through exceptional service, transparent pricing, and outstanding results — no matter the size of the project."}
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm font-medium text-brand-black">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
