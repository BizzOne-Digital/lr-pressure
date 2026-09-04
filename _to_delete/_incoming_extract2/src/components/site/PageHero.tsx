interface PageHeroProps {
  title: string;
  description?: string;
}

export function PageHero({ title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-black py-20 lg:py-28">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-red/10 blur-3xl" />
      <div className="container-lux relative text-center">
        <div className="mx-auto mb-4 flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-red-light">
          <span className="h-px w-6 bg-brand-red-light" />
          LR Pressure Washing
          <span className="h-px w-6 bg-brand-red-light" />
        </div>
        <h1 className="text-balance font-heading text-4xl font-extrabold text-white sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-balance leading-relaxed text-white/65">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
