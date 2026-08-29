import { getSiteSettings } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";

export const metadata = { title: "Terms of Service | LR Pressure Washing" };

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero title="Terms of Service" />
      <section className="bg-white py-16 lg:py-20">
        <div className="container-lux max-w-3xl space-y-5 leading-relaxed text-brand-gray-700">
          <p className="text-sm text-brand-gray-500">
            This is placeholder terms language. Replace it with content reviewed for your
            business before publishing live.
          </p>
          <p>
            By requesting a quote or scheduling service with {settings.businessName}, you agree
            to provide accurate contact and property information so we can deliver an accurate
            estimate and schedule your service.
          </p>
          <p>
            Quotes provided are estimates based on the information submitted and may be adjusted
            after an on-site assessment. Final pricing and scheduling will be confirmed directly
            with you before any work begins.
          </p>
          <p>
            Questions about these terms can be directed to{" "}
            <a href={`mailto:${settings.email}`} className="font-semibold text-brand-red">
              {settings.email}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
