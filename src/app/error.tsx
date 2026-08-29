"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-6 text-center">
      <p className="font-heading text-6xl font-extrabold text-brand-red">Oops</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-white">
        Something went wrong.
      </h1>
      <p className="mt-3 max-w-md text-white/60">
        We hit an unexpected error loading this page. Please try again, or contact us directly if
        the problem continues.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
