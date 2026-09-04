import { MapPin } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { HomeContent } from "@/lib/content-schemas";

export function ServiceArea({
  section,
  areas = [],
}: {
  section: HomeContent["serviceArea"];
  areas?: string[];
}) {
  if (!areas.length && !section?.description) return null;

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Where We Work"
          title={section.heading || "We're Here To Help"}
          description={section.description}
        />
        {areas.length > 0 && (
          <div className="mt-10 rounded-[1.75rem] border border-brand-gray-200 bg-brand-cream p-8 sm:p-10">
            <div className="flex flex-wrap justify-center gap-3">
              {areas.map((area) => (
                <span
                  key={area}
                  className="flex items-center gap-2 rounded-full border border-brand-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-black"
                >
                  <MapPin className="h-4 w-4 text-brand-red" />
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
