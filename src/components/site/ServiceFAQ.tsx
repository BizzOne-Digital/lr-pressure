"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface FAQItem {
  question: string;
  answer: string;
}

export function ServiceFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items.length) return null;

  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="container-lux max-w-3xl">
        <SectionHeading eyebrow="Questions" title="Frequently Asked Questions" />
        <div className="mt-12 space-y-3">
          {items.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={i} className="overflow-hidden rounded-lg border border-brand-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="font-heading text-sm font-bold text-brand-black">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-brand-gray-500 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open && (
                  <div className="border-t border-brand-gray-200 px-5 py-4">
                    <p className="text-sm leading-relaxed text-brand-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
