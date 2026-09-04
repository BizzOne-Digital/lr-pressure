import Link from "next/link";
import { type ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "light";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:opacity-50 disabled:pointer-events-none rounded-full";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-black text-white hover:bg-brand-charcoal-2 shadow-[0_8px_30px_-8px_rgba(4,6,8,0.5)] hover:shadow-[0_8px_30px_-4px_rgba(4,6,8,0.65)]",
  // Used for the header CTA, which sits directly on the black header bar —
  // the true brand red doesn't have enough contrast there on its own, so
  // this uses the brighter -light tint and deepens to the true red on hover.
  secondary:
    "bg-brand-red-light text-white hover:bg-brand-red",
  outline:
    "border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-white",
  ghost: "text-brand-black hover:text-brand-red",
  // Solid white pill — for a primary call-to-action placed over a dark
  // section (Hero, CTASection), where a black button would have no contrast
  // against the dark background.
  light: "bg-white text-brand-black hover:bg-brand-gray-50",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3.5 text-sm sm:text-base",
  lg: "px-8 py-4 text-base sm:text-lg",
};

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  disabled,
  className,
  icon,
}: ButtonProps) {
  const classes = clsx(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {icon}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
      {icon}
    </button>
  );
}
