import { MapPin } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { HomeContent } from "@/lib/content-schemas";

export function ServiceArea({ section }: { section: HomeContent["serviceArea"] }) {
  if (!section?.areas?.length && !section?.description) return null;

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Where We Work"
          title={section.heading || "Proudly Serving Your Area"}
          description={section.description}
        />
        {section.areas?.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {section.areas.map((area) => (
              <span
                key={area}
                className="flex items-center gap-2 rounded-full border border-brand-gray-200 bg-brand-cream px-5 py-2.5 text-sm font-semibold text-brand-black"
              >
                <MapPin className="h-4 w-4 text-brand-red" />
                {area}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
