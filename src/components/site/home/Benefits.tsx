import { Icon } from "@/components/icon-map";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import type { HomeContent } from "@/lib/content-schemas";

export function Benefits({ benefits }: { benefits: HomeContent["benefits"] }) {
  if (!benefits?.length) return null;
  const sorted = [...benefits].sort((a, b) => a.order - b.order);

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Why Homeowners Choose Us"
          title="Built On Trust, Backed By Results"
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 0.08}>
              <div className="group h-full rounded-lg border border-brand-gray-200 bg-brand-cream p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-xl hover:shadow-black/5">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-brand-black text-white transition-colors duration-300 group-hover:bg-brand-red">
                  <Icon name={benefit.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-brand-black">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-gray-600">
                  {benefit.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
