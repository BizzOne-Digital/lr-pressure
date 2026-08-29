import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/icon-map";
import { mediaUrl } from "@/lib/media-url";
import type { IService } from "@/models/Service";

export function ServiceCard({ service }: { service: IService }) {
  const img = mediaUrl(service.imageMediaId?.toString()) || "/image-fallback.jpg";

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-brand-black shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/20"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={img}
          alt={service.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent" />
        <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-md bg-brand-red text-white shadow-lg">
          <Icon name={service.icon} className="h-5 w-5" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-bold text-white">{service.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
          {service.shortDescription || service.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-red-light transition-transform group-hover:translate-x-1">
          Learn More <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
