import type { Metadata } from "next";
import Image from "next/image";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/components/social-icons";
import { getPageContent, getTeamMembers, getSiteSettings } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { CTASection } from "@/components/site/home/CTASection";
import { mediaUrl } from "@/lib/media-url";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, content } = await getPageContent("team");
  return {
    title: seo.title || `Our Team | ${content.heading || "LR Pressure Washing"}`,
    description: seo.metaDescription || content.intro,
  };
}

export default async function TeamPage() {
  const [{ content }, members, settings, { content: homeContent }] = await Promise.all([
    getPageContent("team"),
    getTeamMembers(),
    getSiteSettings(),
    getPageContent("home"),
  ]);

  return (
    <>
      <PageHero
        title={content.heading || "Meet Our Team"}
        description={content.intro || "The people behind every job we do."}
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux">
          {members.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member) => {
                const photo = mediaUrl(member.photoMediaId?.toString());
                return (
                  <div key={member._id.toString()} className="group text-center">
                    <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-lg bg-brand-cream shadow-md shadow-black/5">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={member.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="224px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-brand-black text-3xl font-bold text-white">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-bold text-brand-black">
                      {member.name}
                    </h3>
                    <p className="text-sm font-semibold text-brand-red">{member.role}</p>
                    {member.bio && (
                      <p className="mt-2 text-sm leading-relaxed text-brand-gray-600">
                        {member.bio}
                      </p>
                    )}
                    <div className="mt-3 flex justify-center gap-3">
                      {member.socialLinks?.facebook && (
                        <a
                          href={member.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on Facebook`}
                          className="text-brand-gray-400 hover:text-brand-red"
                        >
                          <FacebookIcon className="h-4 w-4" />
                        </a>
                      )}
                      {member.socialLinks?.instagram && (
                        <a
                          href={member.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on Instagram`}
                          className="text-brand-gray-400 hover:text-brand-red"
                        >
                          <InstagramIcon className="h-4 w-4" />
                        </a>
                      )}
                      {member.socialLinks?.linkedin && (
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on LinkedIn`}
                          className="text-brand-gray-400 hover:text-brand-red"
                        >
                          <LinkedinIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-brand-gray-600">
              Team profiles are coming soon.
            </p>
          )}
        </div>
      </section>

      <CTASection section={homeContent.cta} phone={settings.phone} />
    </>
  );
}
