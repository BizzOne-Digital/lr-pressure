import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-6 text-center">
      <p className="font-heading text-8xl font-extrabold text-brand-red-light">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl">
        This page washed away.
      </h1>
      <p className="mt-3 max-w-md text-white/60">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button href="/">Back to Home</Button>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-sm border-2 border-white px-6 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-brand-black"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
