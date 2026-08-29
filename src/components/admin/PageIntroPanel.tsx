"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";

interface PageIntroPanelProps {
  pageKey: "services" | "team";
  title: string;
}

interface Content {
  heading: string;
  intro: string;
}
interface SEO {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
}

export function PageIntroPanel({ pageKey, title }: PageIntroPanelProps) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<Content | null>(null);
  const [seo, setSeo] = useState<SEO | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/pages/${pageKey}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setContent(json.data.content);
          setSeo(json.data.seo);
        }
      });
  }, [pageKey]);

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, seo, status: "published" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `${title} updated.`);
        setContent(json.data.content);
        setSeo(json.data.seo);
      } else {
        showToast("error", json.error || "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!content || !seo) return null;

  return (
    <div className="mb-6 rounded-lg border border-brand-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="font-heading text-sm font-bold text-brand-black">
          {title} Heading &amp; Intro
        </span>
        <ChevronDown className={`h-4 w-4 text-brand-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-brand-gray-200 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Page Heading</label>
            <input
              value={content.heading}
              onChange={(e) => setContent({ ...content, heading: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Intro Text</label>
            <textarea
              rows={2}
              value={content.intro}
              onChange={(e) => setContent({ ...content, intro: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">SEO Title</label>
            <input
              value={seo.title}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-md bg-brand-black px-4 py-2 text-sm font-bold text-white hover:bg-brand-charcoal-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
