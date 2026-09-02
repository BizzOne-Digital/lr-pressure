import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import { getProjectBySlug, getProjects, getServiceBySlug, getSiteSettings, getPageContent } from "@/lib/data";
import { CTASection } from "@/components/site/home/CTASection";
import { Button } from "@/components/ui/Button";
import { mediaUrl } from "@/lib/media-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | LR Pressure Washing`,
    description: project.summary || project.description,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, allProjects, settings, { content: homeContent }] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
    getSiteSettings(),
    getPageContent("home"),
  ]);

  if (!project) notFound();

  const relatedService = project.serviceSlug ? await getServiceBySlug(project.serviceSlug) : null;
  const coverImg = mediaUrl(project.imageMediaId?.toString());
  const beforeImg = mediaUrl(project.beforeImageMediaId?.toString());
  const afterImg = mediaUrl(project.afterImageMediaId?.toString());
  const heroImg = coverImg || afterImg || beforeImg;
  const otherProjects = allProjects.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-brand-black">
        <div className="absolute inset-0">
          {heroImg && (
            <Image src={heroImg} alt="" fill className="object-cover opacity-40" sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-brand-black/50" />
        </div>
        <div className="container-lux relative py-20 lg:py-28">
          <Link
            href="/projects"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All Projects
          </Link>
          <h1 className="max-w-2xl text-balance font-heading text-4xl font-extrabold text-white sm:text-5xl">
            {project.title}
          </h1>
          {project.location && (
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/65">
              <MapPin className="h-4 w-4 text-brand-red" />
              {project.location}
            </p>
          )}
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux grid gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            {beforeImg && afterImg ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="relative h-64 w-full overflow-hidden rounded-lg">
                    <Image src={beforeImg} alt={`${project.title} — before`} fill className="object-cover" sizes="(min-width: 640px) 50vw, 100vw" />
                  </div>
                  <p className="mt-2 text-center text-xs font-bold uppercase tracking-wide text-brand-gray-500">Before</p>
                </div>
                <div>
                  <div className="relative h-64 w-full overflow-hidden rounded-lg">
                    <Image src={afterImg} alt={`${project.title} — after`} fill className="object-cover" sizes="(min-width: 640px) 50vw, 100vw" />
                  </div>
                  <p className="mt-2 text-center text-xs font-bold uppercase tracking-wide text-brand-gray-500">After</p>
                </div>
              </div>
            ) : (
              coverImg && (
                <div className="relative h-80 w-full overflow-hidden rounded-lg">
                  <Image src={coverImg} alt={project.title} fill className="object-cover" sizes="(min-width: 1024px) 66vw, 100vw" />
                </div>
              )
            )}

            <h2 className="mt-10 font-heading text-2xl font-bold text-brand-black">Project Overview</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-brand-gray-600">
              {project.description ||
                project.summary ||
                "Contact us for full details on this project and to discuss a similar service for your property."}
            </p>
            <div className="mt-8">
              <Button href="/contact" size="lg">
                Get a Free Quote
              </Button>
            </div>
          </div>

          <aside className="rounded-lg border border-brand-gray-200 bg-brand-cream p-7">
            {relatedService && (
              <>
                <h3 className="font-heading text-lg font-bold text-brand-black">Service Performed</h3>
                <p className="mt-3">
                  <Link
                    href={`/services/${relatedService.slug}`}
                    className="font-semibold text-brand-red hover:underline"
                  >
                    {relatedService.name}
                  </Link>
                </p>
              </>
            )}
            {otherProjects.length > 0 && (
              <>
                <h3 className={`font-heading text-lg font-bold text-brand-black ${relatedService ? "mt-8" : ""}`}>
                  Other Projects
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {otherProjects.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/projects/${p.slug}`}
                        className="font-semibold text-brand-black hover:text-brand-red"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </section>

      <CTASection section={homeContent.cta} phone={settings.phone} />
    </>
  );
}
