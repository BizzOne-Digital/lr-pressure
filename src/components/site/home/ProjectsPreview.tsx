import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { mediaUrl } from "@/lib/media-url";
import type { IProject } from "@/models/Project";

export function ProjectsPreview({ projects }: { projects: IProject[] }) {
  if (!projects.length) return null;

  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading eyebrow="Explore Our Projects" title="Where Our Work Has Made An Impact" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((project, i) => {
            const img =
              mediaUrl(project.imageMediaId?.toString()) ||
              mediaUrl(project.afterImageMediaId?.toString()) ||
              "/image-fallback.jpg";
            return (
              <Reveal key={project._id.toString()} delay={i * 0.08}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-md shadow-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <div className="relative h-52 w-full overflow-hidden">
                    <Image
                      src={img}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-heading text-lg font-bold text-brand-black">
                      {project.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-gray-600">
                      {project.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-red transition-transform group-hover:translate-x-1">
                      View Project <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-14 text-center">
          <Button href="/projects" variant="outline">
            See All Projects
          </Button>
        </div>
      </div>
    </section>
  );
}
