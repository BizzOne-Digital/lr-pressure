import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { getPageContent, getProjects, getSiteSettings } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { CTASection } from "@/components/site/home/CTASection";
import { mediaUrl } from "@/lib/media-url";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, content } = await getPageContent("projects");
  return {
    title: seo.title || `Projects | ${content.heading || "LR Pressure Washing"}`,
    description: seo.metaDescription || content.intro,
  };
}

export default async function ProjectsPage() {
  const [{ content }, projects, settings, { content: homeContent }] = await Promise.all([
    getPageContent("projects"),
    getProjects(),
    getSiteSettings(),
    getPageContent("home"),
  ]);

  return (
    <>
      <PageHero
        title={content.heading || "Featured Projects"}
        description={
          content.intro || "A closer look at select jobs, from start to finish."
        }
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux">
          {projects.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const img =
                  mediaUrl(project.imageMediaId?.toString()) ||
                  mediaUrl(project.afterImageMediaId?.toString());
                return (
                  <Link
                    key={project._id.toString()}
                    href={`/projects/${project.slug}`}
                    className="group flex flex-col overflow-hidden rounded-lg border border-brand-gray-200 bg-white shadow-lg shadow-black/5 transition-shadow hover:shadow-xl"
                  >
                    <div className="relative h-56 w-full overflow-hidden bg-brand-gray-100">
                      {img ? (
                        <Image
                          src={img}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-brand-gray-400">
                          <MapPin className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-heading text-lg font-bold text-brand-black group-hover:text-brand-red">
                        {project.title}
                      </h3>
                      {project.location && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray-500">
                          <MapPin className="h-3.5 w-3.5 text-brand-red" />
                          {project.location}
                        </p>
                      )}
                      {project.summary && (
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-gray-600">
                          {project.summary}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-red">
                        View Project <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-brand-gray-600">
              We&rsquo;re putting together detailed write-ups of recent projects — check back soon,
              or browse our{" "}
              <Link href="/gallery" className="font-semibold text-brand-red hover:underline">
                photo gallery
              </Link>{" "}
              in the meantime.
            </p>
          )}
        </div>
      </section>

      <CTASection section={homeContent.cta} phone={settings.phone} />
    </>
  );
}
