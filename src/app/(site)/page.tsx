import type { Metadata } from "next";
import {
  getSiteSettings,
  getServices,
  getServicePlans,
  getProjects,
  getTestimonials,
  getTeamMembers,
  getPageContent,
} from "@/lib/data";
import { Hero } from "@/components/site/home/Hero";
import { Benefits } from "@/components/site/home/Benefits";
import { ServicePlansPreview } from "@/components/site/home/ServicePlansPreview";
import { ServicesPreview } from "@/components/site/home/ServicesPreview";
import { ProjectsPreview } from "@/components/site/home/ProjectsPreview";
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
  const [settings, { content }, services, servicePlans, projects, testimonials, teamMembers] =
    await Promise.all([
      getSiteSettings(),
      getPageContent("home"),
      getServices({ onlyFeatured: false }),
      getServicePlans(),
      getProjects(),
      getTestimonials({ onlyFeatured: true }),
      getTeamMembers(),
    ]);

  const testimonialItems = testimonials.length ? testimonials : await getTestimonials();
  const featuredTestimonial = testimonialItems[0] ?? null;

  return (
    <>
      <Hero hero={content.hero} phone={settings.phone} googleBadge={settings.googleReviewsBadgeText} />
      <ServicePlansPreview plans={servicePlans} />
      <ServicesPreview services={services} />
      <Benefits benefits={content.benefits} />
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
              className="rounded-full bg-brand-black px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-charcoal-2"
            >
              Leave Us a Review
            </a>
          )}
        </div>
      )}

      <TeamPreview members={teamMembers} />
      <ProjectsPreview projects={projects} />
      <ServiceArea section={content.serviceArea} areas={settings.serviceAreas} />
      <FeaturedTestimonial testimonial={featuredTestimonial} />
      <CTASection section={content.cta} phone={settings.phone} />
    </>
  );
}
