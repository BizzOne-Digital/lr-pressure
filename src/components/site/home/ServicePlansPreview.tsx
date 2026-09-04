import { Check } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import type { IServicePlan } from "@/models/ServicePlan";

export function ServicePlansPreview({ plans }: { plans: IServicePlan[] }) {
  if (!plans.length) return null;

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Save With A Plan"
          title="Keep Your Property Looking Its Best, Year-Round"
          description="Recurring maintenance plans built around how often your property actually needs attention."
        />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">
          {plans.slice(0, 3).map((plan, i) => (
            <Reveal key={plan._id.toString()} delay={i * 0.08}>
              <div
                className={`relative flex h-full flex-col rounded-[1.75rem] border p-8 pt-10 text-center shadow-md shadow-black/5 transition-all duration-300 hover:-translate-y-1.5 ${
                  plan.highlighted
                    ? "border-brand-red/50 bg-brand-cream lg:-translate-y-3"
                    : "border-brand-gray-200 bg-white hover:shadow-xl"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-brand-red px-4 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-white shadow-md">
                    Most Popular
                  </span>
                )}
                {plan.frequency && (
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-red">
                    {plan.frequency}
                  </p>
                )}
                <h3 className="mt-3 font-heading text-lg font-bold text-brand-black">
                  {plan.name}
                </h3>
                {plan.tagline && (
                  <p className="mt-2 text-sm leading-relaxed text-brand-gray-600">
                    {plan.tagline}
                  </p>
                )}
                {plan.features.length > 0 && (
                  <ul className="mt-6 flex-1 space-y-2.5 text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-brand-gray-800">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                          <Check className="h-3 w-3" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-7 border-t border-brand-gray-200 pt-6">
                  <p className="font-heading text-xl font-extrabold text-brand-black">
                    {plan.priceLabel}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-black px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-charcoal-2"
                  >
                    Get Your Quote
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button href="/service-plans" variant="outline">
            View All Plans
          </Button>
        </div>
      </div>
    </section>
  );
}
