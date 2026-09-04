import { Icon } from "@/components/icon-map";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

interface ProcessStepLike {
  title: string;
  description: string;
  icon: string;
  order?: number;
}

interface ProcessStepsProps {
  steps: ProcessStepLike[] | undefined;
  eyebrow?: string;
  title?: string;
}

export function ProcessSteps({
  steps,
  eyebrow = "How It Works",
  title = "A Simple, Straightforward Process",
}: ProcessStepsProps) {
  if (!steps?.length) return null;
  const sorted =
    steps.every((s) => typeof s.order === "number")
      ? [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : steps;

  return (
    <section className="bg-brand-black py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading eyebrow={eyebrow} title={title} light />
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-red-light bg-brand-black text-brand-red-light">
                  <Icon name={step.icon} className="h-7 w-7" />
                </div>
                <div className="mx-auto mt-4 font-heading text-xs font-bold uppercase tracking-[0.2em] text-brand-red-light">
                  Step {i + 1}
                </div>
                <h3 className="mt-2 font-heading text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
                {i < sorted.length - 1 && (
                  <span className="absolute right-[-1.25rem] top-8 hidden h-px w-10 bg-white/15 lg:block" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
