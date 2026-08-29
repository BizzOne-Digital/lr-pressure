"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/ToastProvider";

interface ContactContent {
  heading: string;
  intro: string;
  successMessage: string;
}
interface SEO {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
}

export default function ContactPageEditor() {
  const { showToast } = useToast();
  const [content, setContent] = useState<ContactContent | null>(null);
  const [seo, setSeo] = useState<SEO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages/contact")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setContent(json.data.content);
          setSeo(json.data.seo);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, seo, status: "published" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Contact page updated.");
        setContent(json.data.content);
        setSeo(json.data.seo);
      } else {
        showToast("error", json.error || "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !content || !seo) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-black">Contact Page</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Edit the heading, intro, and confirmation message for the quote form.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      <div className="mt-8 space-y-6">
        <section className="rounded-lg border border-brand-gray-200 bg-white p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Heading</label>
            <input
              value={content.heading}
              onChange={(e) => setContent({ ...content, heading: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Intro Text</label>
            <textarea
              rows={3}
              value={content.intro}
              onChange={(e) => setContent({ ...content, intro: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">
              Form Success Message
            </label>
            <textarea
              rows={2}
              value={content.successMessage}
              onChange={(e) => setContent({ ...content, successMessage: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
            <p className="mt-1 text-xs text-brand-gray-500">
              Shown after a visitor successfully submits a quote request. Avoid promising a
              specific response time unless that&apos;s accurate.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-brand-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-heading text-base font-bold text-brand-black">SEO Settings</h2>
          <input
            value={seo.title}
            placeholder="SEO Title"
            onChange={(e) => setSeo({ ...seo, title: e.target.value })}
            className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
          />
          <textarea
            value={seo.metaDescription}
            placeholder="Meta Description"
            onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
            className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
          />
        </section>
      </div>
    </div>
  );
}
