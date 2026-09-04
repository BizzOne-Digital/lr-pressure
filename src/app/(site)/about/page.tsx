import type { Metadata } from "next";
import Image from "next/image";
import { getPageContent, getServices, getSiteSettings, getTeamMembers } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { Icon } from "@/components/icon-map";
import { ServicesPreview } from "@/components/site/home/ServicesPreview";
import { TeamPreview } from "@/components/site/home/TeamPreview";
import { CTASection } from "@/components/site/home/CTASection";
import { mediaUrl } from "@/lib/media-url";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, content } = await getPageContent("about");
  return {
    title: seo.title || `About Us | ${content.heading || "LR Pressure Washing"}`,
    description: seo.metaDescription || content.missionStatement,
  };
}

export default async function AboutPage() {
  const [{ content }, settings, { content: homeContent }, services, teamMembers] = await Promise.all([
    getPageContent("about"),
    getSiteSettings(),
    getPageContent("home"),
    getServices({ onlyFeatured: false }),
    getTeamMembers(),
  ]);

  const img = mediaUrl(content.imageMediaId) || "/image-fallback.jpg";

  return (
    <>
      <PageHero
        title={content.heading || "About LR Pressure Washing"}
        description={content.missionStatement}
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 h-80 overflow-hidden rounded-lg shadow-2xl shadow-black/10 sm:h-[26rem] lg:order-1 lg:h-[30rem]">
            <Image
              src={img}
              alt={content.heading || "LR Pressure Washing"}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="order-1 lg:order-2">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
              <span className="h-px w-6 bg-brand-red" />
              Our Story
            </div>
            <h2 className="font-heading text-3xl font-bold text-brand-black sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-brand-gray-600">
              {content.content ||
                content.missionStatement ||
                "Our mission is to provide reliable, affordable, and professional pressure washing and exterior care services that consistently exceed customer expectations. We strive to build long-term relationships with our clients by delivering exceptional service, transparent pricing, and outstanding results on every project — no matter the size."}
            </p>
          </div>
        </div>

        {content.values?.length > 0 && (
          <div className="container-lux mt-20">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {content.values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-lg border border-brand-gray-200 bg-brand-cream p-6"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-brand-black text-white">
                    <Icon name={value.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-brand-black">
                    {value.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-gray-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <ServicesPreview services={services} />
      <TeamPreview members={teamMembers} />

      <CTASection section={homeContent.cta} phone={settings.phone} />
    </>
  );
}
