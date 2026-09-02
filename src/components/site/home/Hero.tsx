import Image from "next/image";
import { Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mediaUrl } from "@/lib/media-url";
import type { HomeContent } from "@/lib/content-schemas";

interface HeroProps {
  hero: HomeContent["hero"];
  phone: string;
  googleBadge?: string;
}

export function Hero({ hero, phone, googleBadge }: HeroProps) {
  const imgSrc = mediaUrl(hero.heroImageMediaId) || "/hero-fallback.jpg";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const badges = hero.trustBadges?.length
    ? hero.trustBadges
    : ["Professional", "Reliable", "Affordable", "Quality Results"];

  return (
    <section className="relative isolate overflow-hidden bg-brand-black">
      <div className="absolute inset-0">
        <Image
          src={imgSrc}
          alt=""
          fill
          priority
          className="object-cover opacity-[0.55]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/70 to-brand-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black/60 via-transparent to-transparent" />
      </div>

      <div className="container-lux relative z-10 flex min-h-[86vh] flex-col justify-center py-24 sm:min-h-[80vh]">
        <div className="max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-red/40 bg-brand-red/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red-light">
              Local &amp; Professional Exterior Cleaning
            </div>
            {googleBadge && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white">
                <span className="flex gap-0.5 text-brand-red">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3" fill="currentColor" />
                  ))}
                </span>
                {googleBadge}
              </div>
            )}
          </div>
          <h1 className="text-balance font-heading text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            {hero.heading || "Dirty Windows, House, Driveway, or Roof?"}
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-white/75">
            {hero.subheading ||
              "LR Pressure Washing restores the look of your property with professional exterior cleaning — from siding and driveways to roofs and windows."}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button href={hero.ctaUrl || "/contact"} size="lg">
              {hero.ctaText || "Get a Free Quote"}
            </Button>
            <Button
              href={telHref}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-brand-black"
              icon={<Phone className="h-5 w-5" />}
            >
              Call Now
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold text-white/70">
            {badges.map((badge, i) => (
              <span key={badge} className="flex items-center gap-2">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-brand-red" />}
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
