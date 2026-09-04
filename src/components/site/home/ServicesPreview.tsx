import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ServiceCard } from "@/components/site/ServiceCard";
import type { IService } from "@/models/Service";

export function ServicesPreview({ services }: { services: IService[] }) {
  if (!services.length) return null;

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Our Premium Services"
          title="Complete Exterior Cleaning Services"
          description="From driveways to rooftops, every service is performed with the same attention to detail and professional care."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.07}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button href="/services" variant="outline">
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
}
