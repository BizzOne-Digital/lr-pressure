"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mediaUrl } from "@/lib/media-url";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
  showInHeader?: boolean;
}

interface ServiceLink {
  name: string;
  slug: string;
}

interface HeaderProps {
  businessName: string;
  phone: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  navItems: NavItem[];
  logoMediaId?: string;
  serviceLinks?: ServiceLink[];
}

export function Header({
  businessName,
  phone,
  primaryCtaText,
  primaryCtaUrl,
  navItems,
  logoMediaId,
  serviceLinks = [],
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const logoSrc = mediaUrl(logoMediaId);
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  // Keep the header itself minimal — items marked showInHeader: false (set
  // via the admin Navigation page) stay fully linkable from the footer,
  // they just don't clutter the top bar.
  const headerNavItems = navItems.filter((item) => item.showInHeader !== false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-brand-gray-200 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/10" : "bg-white"
      }`}
    >
      <div className="container-lux flex h-16 items-center justify-between lg:h-20">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={`${businessName} home`}>
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={businessName}
              width={160}
              height={48}
              className="h-9 w-auto object-contain lg:h-11"
              priority
            />
          ) : (
            <span className="font-heading text-lg font-bold text-brand-black lg:text-xl">
              LR <span className="text-brand-red">PRESSURE WASHING</span>
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {headerNavItems.map((item) =>
            item.href === "/services" && serviceLinks.length > 0 ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-brand-black/80 transition-colors hover:text-brand-red"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                {servicesOpen && (
                  <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
                    <div className="overflow-hidden rounded-lg bg-white shadow-xl shadow-black/20 ring-1 ring-brand-gray-200">
                      {serviceLinks.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className="block px-4 py-2.5 text-sm font-semibold text-brand-black hover:bg-brand-gray-50 hover:text-brand-red"
                        >
                          {s.name}
                        </Link>
                      ))}
                      <Link
                        href="/services"
                        className="block border-t border-brand-gray-200 px-4 py-2.5 text-sm font-bold text-brand-red hover:bg-brand-gray-50"
                      >
                        View All Services
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold uppercase tracking-wide text-brand-black/80 transition-colors hover:text-brand-red"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={telHref}
            className="flex items-center gap-2 text-sm font-bold text-brand-black transition-colors hover:text-brand-red"
          >
            <Phone className="h-4 w-4 text-brand-red" aria-hidden="true" />
            {phone}
          </a>
          <Button href={primaryCtaUrl} size="sm" variant="secondary">
            {primaryCtaText}
          </Button>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <a href={telHref} aria-label={`Call ${phone}`} className="rounded-full bg-brand-red p-2.5 text-white">
            <Phone className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md p-2 text-brand-black"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-brand-gray-200 bg-white">
          <nav className="container-lux flex flex-col gap-1 py-4" aria-label="Mobile">
            {headerNavItems.map((item) =>
              item.href === "/services" && serviceLinks.length > 0 ? (
                <div key={item.href}>
                  <div className="flex items-center justify-between rounded-md px-3 py-3">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-base font-semibold text-brand-black hover:text-brand-red"
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileServicesOpen((v) => !v)}
                      aria-label="Toggle services submenu"
                      aria-expanded={mobileServicesOpen}
                      className="p-1 text-brand-gray-600"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                  {mobileServicesOpen && (
                    <div className="ml-3 flex flex-col gap-0.5 border-l border-brand-gray-200 pl-3">
                      {serviceLinks.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="rounded-md px-3 py-2 text-sm font-semibold text-brand-black/75 hover:bg-brand-gray-50 hover:text-brand-red"
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-semibold text-brand-black hover:bg-brand-gray-50 hover:text-brand-red"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="mt-3 flex flex-col gap-3 px-3">
              <Button href={primaryCtaUrl} size="md" variant="secondary" className="w-full justify-center">
                {primaryCtaText}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
