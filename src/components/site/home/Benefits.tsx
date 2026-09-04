import { Icon } from "@/components/icon-map";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import type { HomeContent } from "@/lib/content-schemas";

export function Benefits({ benefits }: { benefits: HomeContent["benefits"] }) {
  if (!benefits?.length) return null;
  const sorted = [...benefits].sort((a, b) => a.order - b.order);

  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Why Homeowners Choose Us"
          title="Built On Trust, Backed By Results"
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 0.08}>
              <div className="group h-full rounded-[1.75rem] border border-brand-gray-200 bg-white p-8 text-left shadow-md shadow-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-red/40 hover:shadow-xl hover:shadow-black/10">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white transition-transform duration-300 group-hover:scale-110">
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
