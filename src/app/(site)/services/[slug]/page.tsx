import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Phone } from "lucide-react";
import { getServiceBySlug, getServices, getSiteSettings, getPageContent } from "@/lib/data";
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

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, allServices, settings, { content: homeContent }] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
    getSiteSettings(),
    getPageContent("home"),
  ]);

  if (!service) notFound();

  const img = mediaUrl(service.imageMediaId?.toString()) || "/image-fallback.jpg";
  const otherServices = allServices.filter((s) => s.slug !== slug).slice(0, 3);
  const telHref = `tel:${settings.phone.replace(/[^\d+]/g, "")}`;

  return (
    <>
      <section className="relative overflow-hidden bg-brand-black">
        <div className="absolute inset-0">
          <Image src={img} alt="" fill className="object-cover opacity-40" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-brand-black/50" />
        </div>
        <div className="container-lux relative py-20 lg:py-28">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-red text-white">
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

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux grid gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-bold text-brand-black">Overview</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-brand-gray-600">
              {service.description ||
                "Contact us for full details on this service and to receive a free, no-obligation quote."}
            </p>
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

          <aside className="rounded-lg border border-brand-gray-200 bg-brand-cream p-7">
            <h3 className="font-heading text-lg font-bold text-brand-black">
              Why book with LR Pressure Washing?
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {["Reliable & on-time service", "Transparent, upfront pricing", "Professional results"].map(
                (item) => (
                  <li key={item} className="flex items-start gap-2.5 text-brand-black">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                    {item}
                  </li>
                )
              )}
            </ul>
            {otherServices.length > 0 && (
              <>
                <h3 className="mt-8 font-heading text-lg font-bold text-brand-black">
                  Other Services
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {otherServices.map((s) => (
                    <li key={s.slug}>
                      <a
                        href={`/services/${s.slug}`}
                        className="font-semibold text-brand-black hover:text-brand-red"
                      >
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </section>

      <CTASection section={homeContent.cta} phone={settings.phone} />
    </>
  );
}
