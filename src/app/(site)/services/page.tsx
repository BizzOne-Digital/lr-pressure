import type { Metadata } from "next";
import { getPageContent, getServices, getSiteSettings } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { ServiceCard } from "@/components/site/ServiceCard";
import { CTASection } from "@/components/site/home/CTASection";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, content } = await getPageContent("services");
  return {
    title: seo.title || `Services | ${content.heading || "LR Pressure Washing"}`,
    description: seo.metaDescription || content.intro,
  };
}

export default async function ServicesPage() {
  const [{ content }, services, settings, { content: homeContent }] = await Promise.all([
    getPageContent("services"),
    getServices(),
    getSiteSettings(),
    getPageContent("home"),
  ]);

  return (
    <>
      <PageHero
        title={content.heading || "Our Services"}
        description={
          content.intro ||
          "Professional exterior cleaning services for every part of your property."
        }
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux">
          {services.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          ) : (
            <p className="text-center text-brand-gray-600">
              Our service list is being updated. Please check back soon, or contact us directly
              for a quote.
            </p>
          )}
        </div>
      </section>

      <CTASection section={homeContent.cta} phone={settings.phone} />
    </>
  );
}
