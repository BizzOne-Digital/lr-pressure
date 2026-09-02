import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getPageContent, getServicePlans, getSiteSettings } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { CTASection } from "@/components/site/home/CTASection";
import { mediaUrl } from "@/lib/media-url";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, content } = await getPageContent("service-plans");
  return {
    title: seo.title || `Service Plans | ${content.heading || "LR Pressure Washing"}`,
    description: seo.metaDescription || content.intro,
  };
}

export default async function ServicePlansPage() {
  const [{ content }, plans, settings, { content: homeContent }] = await Promise.all([
    getPageContent("service-plans"),
    getServicePlans(),
    getSiteSettings(),
    getPageContent("home"),
  ]);

  return (
    <>
      <PageHero
        title={content.heading || "Service Plans"}
        description={
          content.intro ||
          "Recurring maintenance plans to keep your property looking its best year-round. Pricing is customized per property — contact us for a personalized quote."
        }
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux">
          {plans.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const img = mediaUrl(plan.imageMediaId?.toString());
                return (
                  <div
                    key={plan._id.toString()}
                    className={`flex flex-col overflow-hidden rounded-lg shadow-lg shadow-black/10 ${
                      plan.highlighted
                        ? "border-2 border-brand-red bg-brand-black text-white"
                        : "border border-brand-gray-200 bg-white"
                    }`}
                  >
                    {img && (
                      <div className="relative h-40 w-full">
                        <Image src={img} alt={plan.name} fill className="object-cover" sizes="400px" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-7">
                      {plan.highlighted && (
                        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-red px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                          Most Popular
                        </span>
                      )}
                      <h3
                        className={`font-heading text-xl font-bold ${
                          plan.highlighted ? "text-white" : "text-brand-black"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      {plan.frequency && (
                        <p
                          className={`mt-1 text-xs font-bold uppercase tracking-wide ${
                            plan.highlighted ? "text-brand-red-light" : "text-brand-red"
                          }`}
                        >
                          {plan.frequency}
                        </p>
                      )}
                      {plan.tagline && (
                        <p
                          className={`mt-3 text-sm leading-relaxed ${
                            plan.highlighted ? "text-white/65" : "text-brand-gray-600"
                          }`}
                        >
                          {plan.tagline}
                        </p>
                      )}
                      {plan.features.length > 0 && (
                        <ul className="mt-5 flex-1 space-y-2">
                          {plan.features.map((feature, i) => (
                            <li
                              key={i}
                              className={`flex items-start gap-2 text-sm ${
                                plan.highlighted ? "text-white/80" : "text-brand-gray-800"
                              }`}
                            >
                              <Check
                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                  plan.highlighted ? "text-brand-red-light" : "text-brand-red"
                                }`}
                              />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div
                        className={`mt-6 border-t pt-5 ${
                          plan.highlighted ? "border-white/15" : "border-brand-gray-200"
                        }`}
                      >
                        <p
                          className={`font-heading text-lg font-bold ${
                            plan.highlighted ? "text-white" : "text-brand-black"
                          }`}
                        >
                          {plan.priceLabel}
                        </p>
                        <Link
                          href="/contact"
                          className={`mt-4 inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-bold transition-colors ${
                            plan.highlighted
                              ? "bg-brand-red text-white hover:bg-brand-red-light"
                              : "bg-brand-black text-white hover:bg-brand-gray-800"
                          }`}
                        >
                          Get a Free Quote
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-brand-gray-600">
              Our service plans are being finalized. Contact us directly for a personalized
              maintenance quote.
            </p>
          )}
        </div>
      </section>

      <CTASection section={homeContent.cta} phone={settings.phone} />
    </>
  );
}
