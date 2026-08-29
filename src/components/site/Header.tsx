"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mediaUrl } from "@/lib/media-url";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  businessName: string;
  phone: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  navItems: NavItem[];
  logoMediaId?: string;
}

export function Header({
  businessName,
  phone,
  primaryCtaText,
  primaryCtaUrl,
  navItems,
  logoMediaId,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoSrc = mediaUrl(logoMediaId);
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-brand-black/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-brand-black"
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
            <span className="font-heading text-lg font-bold text-white lg:text-xl">
              LR <span className="text-brand-red">PRESSURE WASHING</span>
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold uppercase tracking-wide text-white/85 transition-colors hover:text-brand-red"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={telHref}
            className="flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-brand-red"
          >
            <Phone className="h-4 w-4 text-brand-red" aria-hidden="true" />
            {phone}
          </a>
          <Button href={primaryCtaUrl} size="sm">
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
            className="rounded-md p-2 text-white"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-brand-black">
          <nav className="container-lux flex flex-col gap-1 py-4" aria-label="Mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-3 text-base font-semibold text-white/90 hover:bg-white/5 hover:text-brand-red"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-3 px-3">
              <Button href={primaryCtaUrl} size="md" className="w-full justify-center">
                {primaryCtaText}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
