import { getSiteSettings } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";

export const metadata = { title: "Privacy Policy | LR Pressure Washing" };

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero title="Privacy Policy" />
      <section className="bg-white py-16 lg:py-20">
        <div className="container-lux max-w-3xl space-y-5 leading-relaxed text-brand-gray-700">
          <p className="text-sm text-brand-gray-500">
            This is placeholder policy language. Replace it with content reviewed for your
            business before publishing live.
          </p>
          <p>
            {settings.businessName} collects the information you submit through our contact and
            quote request forms (such as your name, phone number, email address, and property
            address) solely to respond to your inquiry and provide requested services. We do not
            sell your personal information to third parties.
          </p>
          <p>
            Information you provide is stored securely and is only accessible to authorized staff
            for the purpose of following up on your request and delivering our services.
          </p>
          <p>
            If you have questions about this policy or would like your information removed,
            contact us at{" "}
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
