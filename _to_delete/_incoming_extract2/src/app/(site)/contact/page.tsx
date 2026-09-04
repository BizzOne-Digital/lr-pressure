import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getPageContent, getServices, getSiteSettings, getTestimonials } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { QuoteForm } from "@/components/site/QuoteForm";
import { Testimonials } from "@/components/site/Testimonials";
import { CTASection } from "@/components/site/home/CTASection";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, content } = await getPageContent("contact");
  return {
    title: seo.title || `Contact Us | ${content.heading || "LR Pressure Washing"}`,
    description: seo.metaDescription || content.intro,
  };
}

export default async function ContactPage() {
  const [{ content }, services, settings, testimonials, { content: homeContent }] = await Promise.all([
    getPageContent("contact"),
    getServices(),
    getSiteSettings(),
    getTestimonials({ onlyFeatured: true }),
    getPageContent("home"),
  ]);

  const telHref = `tel:${settings.phone.replace(/[^\d+]/g, "")}`;

  return (
    <>
      <PageHero
        title={content.heading || "Get Your Free Quote"}
        description={
          content.intro ||
          "Tell us about your project and we'll get back to you with a free, no-obligation quote."
        }
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-brand-gray-200 p-6 sm:p-9">
              <h2 className="font-heading text-2xl font-bold text-brand-black">
                Request a Free Quote
              </h2>
              <p className="mt-2 text-sm text-brand-gray-600">
                Fields marked with <span className="text-brand-red">*</span> are required.
              </p>
              <div className="mt-7">
                <QuoteForm
                  services={services.map((s) => ({ name: s.name, slug: s.slug }))}
                  successMessage={
                    content.successMessage ||
                    "Thank you! Your quote request has been received. We'll be in touch shortly."
                  }
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-6 rounded-lg bg-brand-black p-8 text-white">
              <h3 className="font-heading text-xl font-bold">Contact Information</h3>
              <a href={telHref} className="flex items-start gap-3 hover:text-brand-red-light">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-red-light" />
                <span className="font-semibold">{settings.phone}</span>
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-start gap-3 hover:text-brand-red-light"
              >
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-red-light" />
                <span className="break-all font-semibold">{settings.email}</span>
              </a>
              {settings.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-red-light" />
                  <span className="font-semibold">{settings.address}</span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-red-light" />
                <span className="font-semibold">
                  {settings.businessHours || "We respond to every request promptly"}
                </span>
              </div>

              <div className="border-t border-white/10 pt-6 text-sm text-white/60">
                Prefer to talk it through? Call us directly and we&apos;ll walk you through
                pricing and scheduling.
              </div>

              {settings.googleReviewUrl && (
                <a
                  href={settings.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-brand-red px-5 py-3 text-sm font-bold text-white hover:bg-brand-red-dark"
                >
                  Leave Us a Review
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <Testimonials items={testimonials} />

      <CTASection section={homeContent.cta} phone={settings.phone} />
    </>
  );
}
