import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSiteSettings, getNavigation, getServices } from "@/lib/data";

// The entire public site reads from MongoDB on every request rather than
// being statically generated at build time — otherwise admin edits would
// only appear after a rebuild/redeploy, which defeats the CMS.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navItems, services] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getServices(),
  ]);

  // LocalBusiness structured data — only confirmed fields are included, and
  // each is only emitted when the admin has actually filled it in.
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.businessName,
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.address ? { address: settings.address } : {}),
    ...(settings.socialLinks
      ? {
          sameAs: Object.values(settings.socialLinks).filter(
            (v): v is string => typeof v === "string" && v.length > 0
          ),
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header
        businessName={settings.businessName}
        phone={settings.phone}
        primaryCtaText={settings.primaryCtaText}
        primaryCtaUrl={settings.primaryCtaUrl}
        navItems={navItems}
        logoMediaId={settings.logoMediaId?.toString()}
      />
      <main className="flex-1">{children}</main>
      <Footer
        settings={settings}
        navItems={navItems}
        serviceLinks={services.map((s) => ({ name: s.name, slug: s.slug }))}
      />
    </>
  );
}
