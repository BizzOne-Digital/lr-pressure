import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/social-icons";
import type { ISiteSettings } from "@/models/SiteSettings";

interface NavItem {
  label: string;
  href: string;
}

interface FooterProps {
  settings: ISiteSettings;
  navItems: NavItem[];
  serviceLinks: { name: string; slug: string }[];
}

export function Footer({ settings, navItems, serviceLinks }: FooterProps) {
  const year = new Date().getFullYear();
  const telHref = `tel:${settings.phone?.replace(/[^\d+]/g, "")}`;

  return (
    <footer className="bg-brand-black text-white/80">
      <div className="container-lux grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div>
          <div className="font-heading text-xl font-bold text-white">
            {settings.businessName.split(" ").map((word, i) =>
              i === 0 ? (
                <span key={i}>{word} </span>
              ) : (
                <span key={i} className="text-brand-red">
                  {word}{" "}
                </span>
              )
            )}
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            {settings.businessDescription ||
              "Reliable, affordable, and professional pressure washing and exterior care."}
          </p>
          <div className="mt-5 flex gap-3">
            {settings.socialLinks?.facebook && (
              <a
                href={settings.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full bg-white/10 p-2 hover:bg-brand-red"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            )}
            {settings.socialLinks?.instagram && (
              <a
                href={settings.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full bg-white/10 p-2 hover:bg-brand-red"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {settings.socialLinks?.youtube && (
              <a
                href={settings.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="rounded-full bg-white/10 p-2 hover:bg-brand-red"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Navigation</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/65 hover:text-brand-red">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {serviceLinks.length > 0 ? (
              serviceLinks.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="text-white/65 hover:text-brand-red">
                    {s.name}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-white/40">Coming soon</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={telHref} className="flex items-start gap-2.5 text-white/65 hover:text-brand-red">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                {settings.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-start gap-2.5 text-white/65 hover:text-brand-red"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                <span className="break-all">{settings.email}</span>
              </a>
            </li>
            {settings.address && (
              <li className="flex items-start gap-2.5 text-white/65">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                {settings.address}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/45 sm:flex-row">
          <p>
            &copy; {year} {settings.businessName}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-brand-red">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-red">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
