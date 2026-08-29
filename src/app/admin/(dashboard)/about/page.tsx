"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/ToastProvider";
import { ICON_NAMES } from "@/components/icon-map";

interface AboutValue {
  title: string;
  description: string;
  icon: string;
}

interface AboutContent {
  heading: string;
  missionStatement: string;
  content: string;
  imageMediaId?: string;
  values: AboutValue[];
}

interface SEO {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
}

export default function AboutPageEditor() {
  const { showToast } = useToast();
  const [content, setContent] = useState<AboutContent | null>(null);
  const [seo, setSeo] = useState<SEO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages/about")
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
      const res = await fetch("/api/admin/pages/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, seo, status: "published" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "About page updated.");
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
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-black">About Page</h1>
          <p className="mt-1 text-sm text-brand-gray-600">Edit the content shown on the About Us page.</p>
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
        <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-brand-black">Main Content</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Heading</label>
              <input
                value={content.heading}
                onChange={(e) => setContent({ ...content, heading: e.target.value })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Mission Statement</label>
              <textarea
                rows={3}
                value={content.missionStatement}
                onChange={(e) => setContent({ ...content, missionStatement: e.target.value })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Full Content</label>
              <textarea
                rows={6}
                value={content.content}
                onChange={(e) => setContent({ ...content, content: e.target.value })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <ImageUpload label="Image" value={content.imageMediaId} onChange={(id) => setContent({ ...content, imageMediaId: id })} />
          </div>
        </section>

        <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-brand-black">Our Values</h2>
          <div className="mt-4 space-y-3">
            {content.values.map((v, i) => (
              <div key={i} className="rounded-md border border-brand-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-brand-gray-500">Value {i + 1}</span>
                  <button
                    onClick={() => setContent({ ...content, values: content.values.filter((_, idx) => idx !== i) })}
                    className="text-brand-gray-500 hover:text-brand-red"
                    aria-label="Remove value"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={v.title}
                    placeholder="Title"
                    onChange={(e) =>
                      setContent({ ...content, values: content.values.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)) })
                    }
                    className="rounded-md border border-brand-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                  />
                  <input
                    value={v.description}
                    placeholder="Description"
                    onChange={(e) =>
                      setContent({
                        ...content,
                        values: content.values.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)),
                      })
                    }
                    className="rounded-md border border-brand-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                  />
                  <select
                    value={v.icon}
                    onChange={(e) =>
                      setContent({ ...content, values: content.values.map((x, idx) => (idx === i ? { ...x, icon: e.target.value } : x)) })
                    }
                    className="rounded-md border border-brand-gray-200 px-2 py-2 text-sm focus:border-brand-red focus:outline-none"
                  >
                    {ICON_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <button
              onClick={() => setContent({ ...content, values: [...content.values, { title: "", description: "", icon: "CheckCircle2" }] })}
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-red hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add value
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-brand-black">SEO Settings</h2>
          <div className="mt-4 space-y-4">
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
          </div>
        </section>
      </div>
    </div>
  );
}
