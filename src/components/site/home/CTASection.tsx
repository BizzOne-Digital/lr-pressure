import Image from "next/image";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { mediaUrl } from "@/lib/media-url";
import type { HomeContent } from "@/lib/content-schemas";

interface CTAProps {
  section: HomeContent["cta"];
  phone: string;
}

export function CTASection({ section, phone }: CTAProps) {
  const bg = mediaUrl(section.backgroundImageMediaId) || "/hero-fallback.jpg";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  return (
    <section className="relative isolate overflow-hidden bg-brand-black py-24 lg:py-32">
      <div className="absolute inset-0">
        <Image src={bg} alt="" fill className="object-cover opacity-30" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/85 to-brand-black/70" />
      </div>
      <div className="container-lux relative z-10 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-balance font-heading text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {section.heading || "Ready To Bring Your Property Back To Life?"}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-white/70">
            {section.description ||
              "Request your free, no-obligation quote today and see the LR Pressure Washing difference."}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button href={section.buttonUrl || "/contact"} size="lg">
              {section.buttonText || "Get a Free Quote"}
            </Button>
            <Button
              href={telHref}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-brand-black"
              icon={<Phone className="h-5 w-5" />}
            >
              Call {phone}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
