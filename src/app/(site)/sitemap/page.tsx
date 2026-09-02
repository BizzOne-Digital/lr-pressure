import type { Metadata } from "next";
import Link from "next/link";
import { getServices, getSiteSettings } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Sitemap | LR Pressure Washing",
  description: "A full list of every page on the LR Pressure Washing website.",
};

export default async function SitemapPage() {
  const [services, settings] = await Promise.all([getServices(), getSiteSettings()]);

  const mainPages = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Service Plans", href: "/service-plans" },
    { label: "Projects", href: "/projects" },
    { label: "Gallery", href: "/gallery" },
    { label: "Our Team", href: "/team" },
    { label: "Reviews", href: "/reviews" },
    { label: "Contact", href: "/contact" },
  ];

  const legalPages = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms", href: "/terms" },
  ];

  return (
    <>
      <PageHero
        title="Sitemap"
        description={`A full list of every page on the ${settings.businessName} website.`}
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-brand-black">Main Pages</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {mainPages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="text-brand-gray-600 hover:text-brand-red">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold text-brand-black">Services</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.length > 0 ? (
                services.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-brand-gray-600 hover:text-brand-red"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-brand-gray-400">Coming soon</li>
              )}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold text-brand-black">Legal</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {legalPages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="text-brand-gray-600 hover:text-brand-red">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
