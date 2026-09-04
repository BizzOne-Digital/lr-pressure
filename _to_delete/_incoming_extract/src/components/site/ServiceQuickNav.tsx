import Link from "next/link";
import { Icon } from "@/components/icon-map";

interface ServiceLink {
  name: string;
  slug: string;
  icon: string;
}

interface ServiceQuickNavProps {
  services: ServiceLink[];
  activeSlug: string;
}

/**
 * Horizontal, wrapping pill row of every active service, with the current
 * page's service highlighted — mirrors the service "tab bar" Panther shows
 * at the top of each individual service page so visitors can jump straight
 * to any other service without going back to the services index.
 */
export function ServiceQuickNav({ services, activeSlug }: ServiceQuickNavProps) {
  if (!services.length) return null;

  return (
    <nav
      aria-label="All services"
      className="border-b border-brand-gray-200 bg-white py-5"
    >
      <div className="container-lux flex flex-wrap gap-2.5">
        {services.map((s) => {
          const active = s.slug === activeSlug;
          return (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand-black text-white"
                  : "bg-brand-cream text-brand-black hover:bg-brand-gray-100"
              }`}
            >
              <Icon name={s.icon} className="h-4 w-4" />
              {s.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
