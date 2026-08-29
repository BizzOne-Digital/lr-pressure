import type { Metadata } from "next";
import {
  getSiteSettings,
  getServices,
  getGalleryItems,
  getTestimonials,
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
import { ServiceArea } from "@/components/site/home/ServiceArea";
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
  const [settings, { content }, services, galleryItems, testimonials] = await Promise.all([
    getSiteSettings(),
    getPageContent("home"),
    getServices({ onlyFeatured: false }),
    getGalleryItems(),
    getTestimonials({ onlyFeatured: true }),
  ]);

  const beforeAfterItems = galleryItems.filter((g) => g.category === "Before & After");
  const testimonialItems = testimonials.length ? testimonials : await getTestimonials();

  return (
    <>
      <Hero hero={content.hero} phone={settings.phone} />
      <Benefits benefits={content.benefits} />
      <ServicesPreview services={services} />
      <BeforeAfter section={content.beforeAfter} items={beforeAfterItems} />
      <WhyChooseUs section={content.whyChooseUs} />
      <ProcessSteps steps={content.process} />
      <GallerySection items={galleryItems} />
      <Testimonials items={testimonialItems} />
      <ServiceArea section={content.serviceArea} />
      <CTASection section={content.cta} phone={settings.phone} />
    </>
  );
}
