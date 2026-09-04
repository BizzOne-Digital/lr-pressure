import type { Metadata } from "next";
import Image from "next/image";
import { Star } from "lucide-react";
import { getPageContent, getSiteSettings, getTestimonials } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { CTASection } from "@/components/site/home/CTASection";
import { mediaUrl } from "@/lib/media-url";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, content } = await getPageContent("reviews");
  return {
    title: seo.title || `Reviews | ${content.heading || "LR Pressure Washing"}`,
    description: seo.metaDescription || content.intro,
  };
}

export default async function ReviewsPage() {
  const [{ content }, testimonials, settings, { content: homeContent }] = await Promise.all([
    getPageContent("reviews"),
    getTestimonials(),
    getSiteSettings(),
    getPageContent("home"),
  ]);

  return (
    <>
      <PageHero
        title={content.heading || "Customer Reviews"}
        description={content.intro || "See what our customers have to say about our work."}
      />

      {settings.googleReviewsBadgeText && (
        <div className="flex justify-center bg-white py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-gray-200 bg-brand-cream px-5 py-2.5 text-sm font-bold text-brand-black">
            <span className="flex gap-0.5 text-brand-red">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4" fill="currentColor" />
              ))}
            </span>
            {settings.googleReviewsBadgeText}
          </div>
        </div>
      )}

      <section className="bg-brand-cream py-20 lg:py-28">
        <div className="container-lux">
          {testimonials.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => {
                const photo = mediaUrl(t.photoMediaId?.toString());
                return (
                  <div
                    key={t._id.toString()}
                    className="flex h-full flex-col rounded-lg bg-white p-7 shadow-md shadow-black/5"
                  >
                    <div className="flex gap-0.5 text-brand-red">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="h-4 w-4"
                          fill={idx < t.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-gray-800">
                      &ldquo;{t.testimonialText}&rdquo;
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={t.customerName}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-black text-sm font-bold text-white">
                          {t.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-brand-black">{t.customerName}</p>
                        {t.location && (
                          <p className="text-xs text-brand-gray-600">{t.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-brand-gray-600">
              Reviews are coming soon. Check back shortly, or contact us to hear from past
              customers directly.
            </p>
          )}
        </div>
      </section>

      <CTASection section={homeContent.cta} phone={settings.phone} />
    </>
  );
}
