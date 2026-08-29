import clsx from "clsx";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={clsx(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <div
          className={clsx(
            "mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]",
            align === "center" && "justify-center",
            light ? "text-brand-red-light" : "text-brand-red"
          )}
        >
          <span className="h-px w-6 bg-brand-red" />
          {eyebrow}
        </div>
      )}
      <h2
        className={clsx(
          "text-balance text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl",
          light ? "text-white" : "text-brand-black"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={clsx(
            "mt-4 text-balance text-base leading-relaxed sm:text-lg",
            light ? "text-white/70" : "text-brand-gray-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
