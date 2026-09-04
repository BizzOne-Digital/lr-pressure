import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Phone } from "lucide-react";
import {
  getServiceBySlug,
  getServices,
  getSiteSettings,
  getPageContent,
  getTestimonials,
} from "@/lib/data";
import { ProcessSteps } from "@/components/site/home/ProcessSteps";
import { ServiceFAQ } from "@/components/site/ServiceFAQ";
import { ServiceQuickNav } from "@/components/site/ServiceQuickNav";
import { Testimonials } from "@/components/site/Testimonials";
import { Icon } from "@/components/icon-map";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/site/home/CTASection";
import { mediaUrl } from "@/lib/media-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service Not Found" };
  return {
    title: `${service.name} | LR Pressure Washing`,
    description: service.shortDescription || service.description,
  };
}

// Generic fallback checklist shown only when a service hasn't had its own
// "benefits" bullets filled in yet from the admin dashboard.
const DEFAULT_BENEFITS = [
  "Reliable & on-time service",
  "Transparent, upfront pricing",
  "Professional, careful results",
];

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [
    service,
    allServices,
    settings,
    { content: homeContent },
    { content: servicesContent },
    testimonials,
  ] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
    getSiteSettings(),
    getPageContent("home"),
    getPageContent("services"),
    getTestimonials({ onlyFeatured: true }),
  ]);

  if (!service) notFound();

  const img = mediaUrl(service.imageMediaId?.toString()) || "/image-fallback.jpg";
  const telHref = `tel:${settings.phone.replace(/[^\d+]/g, "")}`;

  const benefits = service.benefits?.length ? service.benefits : DEFAULT_BENEFITS;
  const processSteps = service.processSteps?.length ? service.processSteps : homeContent.process;
  const faqs = service.faqs?.length ? service.faqs : servicesContent.faqs;
  const testimonialItems = testimonials.length ? testimonials : await getTestimonials();

  return (
    <>
      <section className="relative overflow-hidden bg-brand-black">
        <div className="absolute inset-0">
          <Image src={img} alt="" fill className="object-cover opacity-40" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-brand-black/50" />
        </div>
        <div className="container-lux relative py-20 lg:py-28">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red text-white">
            <Icon name={service.icon} className="h-6 w-6" />
          </div>
          <h1 className="mt-5 max-w-2xl text-balance font-heading text-4xl font-extrabold text-white sm:text-5xl">
            {service.name}
          </h1>
          {service.shortDescription && (
            <p className="mt-4 max-w-xl text-balance text-lg text-white/70">
              {service.shortDescription}
            </p>
          )}
        </div>
      </section>

      <ServiceQuickNav
        services={allServices.map((s) => ({ name: s.name, slug: s.slug, icon: s.icon }))}
        activeSlug={slug}
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-brand-black sm:text-3xl">
            {service.name} Overview
          </h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-brand-gray-600">
            {service.description ||
              "Contact us for full details on this service and to receive a free, no-obligation quote."}
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {benefits.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-brand-black">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                {item}
              </li>
            ))}
          </ul>

          {settings.serviceAreas?.length ? (
            <p className="mt-8 rounded-[1.75rem] border border-brand-gray-200 bg-brand-cream p-6 text-sm leading-relaxed text-brand-gray-700">
              We proudly provide {service.name.toLowerCase()} to {settings.serviceAreas.join(", ")}{" "}
              and the surrounding areas. Have a question or ready to book? Reach out below and
              we&apos;ll take care of the rest.
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/contact" size="lg">
              Get a Free Quote
            </Button>
            <Button
              href={telHref}
              variant="outline"
              size="lg"
              icon={<Phone className="h-5 w-5" />}
            >
              Call {settings.phone}
            </Button>
          </div>
        </div>
      </section>

      <ProcessSteps
        steps={processSteps}
        eyebrow="How It Works"
        title={`Our ${service.name} Process`}
      />

      <ServiceFAQ items={faqs} eyebrow="Questions" title={`${service.name} FAQs`} />

      <Testimonials items={testimonialItems} />

      <CTASection
        section={{
          ...homeContent.cta,
          heading: `Ready For Professional ${service.name}?`,
        }}
        phone={settings.phone}
      />
    </>
  );
}
