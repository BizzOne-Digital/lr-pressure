import type { Metadata } from "next";
import {
  getSiteSettings,
  getServices,
  getGalleryItems,
  getTestimonials,
  getTeamMembers,
  getPageContent,
} from "@/lib/data";
import { Hero } from "@/components/site/home/Hero";
import { Benefits } from "@/components/site/home/Benefits";
import { ServicesPreview } from "@/components/site/home/ServicesPreview";
import { BeforeAfter } from "@/components/site/home/BeforeAfter";
import { WhyChooseUs } from "@/components/site/home/WhyChooseUs";
import { ProcessSteps } from "@/components/site/home/ProcessSteps";
import { GallerySection } from "@/components/site/home/GallerySection";
import { Testimonials } from "@/components/site/Testimonials";
import { FeaturedTestimonial } from "@/components/site/home/FeaturedTestimonial";
import { ServiceArea } from "@/components/site/home/ServiceArea";
import { TeamPreview } from "@/components/site/home/TeamPreview";
import { CTASection } from "@/components/site/home/CTASection";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageContent("home");
  const settings = await getSiteSettings();
  return {
    title: seo.title || settings.seoDefaults?.title || `${settings.businessName} | Free Quotes`,
    description: seo.metaDescription || settings.seoDefaults?.description,
    openGraph: {
      title: seo.ogTitle || seo.title || settings.businessName,
      description: seo.ogDescription || seo.metaDescription,
    },
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
  };
}

export default async function HomePage() {
  const [settings, { content }, services, galleryItems, testimonials, teamMembers] =
    await Promise.all([
      getSiteSettings(),
      getPageContent("home"),
      getServices({ onlyFeatured: false }),
      getGalleryItems(),
      getTestimonials({ onlyFeatured: true }),
      getTeamMembers(),
    ]);

  const beforeAfterItems = galleryItems.filter((g) => g.category === "Before & After");
  const testimonialItems = testimonials.length ? testimonials : await getTestimonials();
  const featuredTestimonial = testimonialItems[0] ?? null;
  // GallerySection is a Client Component, so it needs plain, JSON-serializable
  // props — lean() docs still carry ObjectId/Date instances, which Next.js
  // refuses to pass across the server/client boundary.
  const galleryCardItems = galleryItems.map((g) => ({
    _id: g._id.toString(),
    title: g.title,
    caption: g.caption,
    category: g.category,
    imageMediaId: g.imageMediaId?.toString(),
  }));

  return (
    <>
      <Hero hero={content.hero} phone={settings.phone} googleBadge={settings.googleReviewsBadgeText} />
      <Benefits benefits={content.benefits} />
      <ServicesPreview services={services} />
      <BeforeAfter section={content.beforeAfter} items={beforeAfterItems} />
      <WhyChooseUs section={content.whyChooseUs} />
      <ProcessSteps steps={content.process} />
      <GallerySection items={galleryCardItems} />
      <Testimonials items={testimonialItems} />

      {(testimonialItems.length > 0 || settings.googleReviewUrl) && (
        <div className="flex flex-wrap items-center justify-center gap-6 bg-brand-cream pb-16">
          <a href="/reviews" className="text-sm font-bold text-brand-red hover:underline">
            See All Reviews
          </a>
          {settings.googleReviewUrl && (
            <a
              href={settings.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-brand-black px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-charcoal-2"
            >
              Leave Us a Review
            </a>
          )}
        </div>
      )}

      <FeaturedTestimonial testimonial={featuredTestimonial} />
      <ServiceArea section={content.serviceArea} areas={settings.serviceAreas} />
      <CTASection section={content.cta} phone={settings.phone} />
      <TeamPreview members={teamMembers} />
    </>
  );
}
