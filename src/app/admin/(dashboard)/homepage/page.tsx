"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/ToastProvider";
import { Icon, ICON_NAMES } from "@/components/icon-map";

interface HomeContent {
  hero: {
    heading: string;
    subheading: string;
    heroImageMediaId?: string;
    ctaText: string;
    ctaUrl: string;
    secondaryCtaText: string;
    secondaryCtaUrl: string;
    trustBadges: string[];
  };
  benefits: { title: string; description: string; icon: string; order: number }[];
  whyChooseUs: { heading: string; content: string; imageMediaId?: string; points: string[] };
  process: { title: string; description: string; icon: string; order: number }[];
  beforeAfter: { heading: string; description: string };
  serviceArea: { heading: string; description: string };
  cta: {
    heading: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
    backgroundImageMediaId?: string;
  };
}

interface SEO {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
      <h2 className="font-heading text-base font-bold text-brand-black">{title}</h2>
      {description && <p className="mt-1 text-xs text-brand-gray-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-brand-black">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
        />
      )}
    </div>
  );
}

function ListEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => onChange(items.map((it, idx) => (idx === i ? e.target.value : it)))}
            className="flex-1 rounded-md border border-brand-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="rounded-md p-2 text-brand-gray-500 hover:text-brand-red"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-sm font-semibold text-brand-red hover:underline"
      >
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

export default function HomepageEditorPage() {
  const { showToast } = useToast();
  const [content, setContent] = useState<HomeContent | null>(null);
  const [seo, setSeo] = useState<SEO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages/home")
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
      const res = await fetch("/api/admin/pages/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, seo, status: "published" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Homepage updated.");
        setContent(json.data.content);
        setSeo(json.data.seo);
      } else {
        showToast("error", json.error || "Failed to save homepage.");
      }
    } catch {
      showToast("error", "Network error while saving.");
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
          <h1 className="font-heading text-2xl font-bold text-brand-black">Homepage Editor</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Edit every section of your homepage without touching code.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Homepage
        </button>
      </div>

      <div className="mt-8 space-y-6">
        <Card title="Hero Section">
          <Field label="Heading" value={content.hero.heading} onChange={(v) => setContent({ ...content, hero: { ...content.hero, heading: v } })} />
          <Field label="Subheading" value={content.hero.subheading} textarea onChange={(v) => setContent({ ...content, hero: { ...content.hero, subheading: v } })} />
          <ImageUpload label="Hero Image" value={content.hero.heroImageMediaId} onChange={(id) => setContent({ ...content, hero: { ...content.hero, heroImageMediaId: id } })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary CTA Text" value={content.hero.ctaText} onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaText: v } })} />
            <Field label="Primary CTA URL" value={content.hero.ctaUrl} onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaUrl: v } })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Secondary CTA Text" value={content.hero.secondaryCtaText} onChange={(v) => setContent({ ...content, hero: { ...content.hero, secondaryCtaText: v } })} />
            <Field label="Secondary CTA URL" value={content.hero.secondaryCtaUrl} onChange={(v) => setContent({ ...content, hero: { ...content.hero, secondaryCtaUrl: v } })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Trust Badges</label>
            <ListEditor items={content.hero.trustBadges} onChange={(v) => setContent({ ...content, hero: { ...content.hero, trustBadges: v } })} />
          </div>
        </Card>

        <Card title="Benefits" description="Shown as a 4-column trust section below the hero.">
          {content.benefits.map((b, i) => (
            <div key={i} className="rounded-md border border-brand-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-brand-gray-500">Benefit {i + 1}</span>
                <button
                  onClick={() => setContent({ ...content, benefits: content.benefits.filter((_, idx) => idx !== i) })}
                  className="text-brand-gray-500 hover:text-brand-red"
                  aria-label="Remove benefit"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={b.title}
                  placeholder="Title"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      benefits: content.benefits.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)),
                    })
                  }
                  className="rounded-md border border-brand-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                />
                <input
                  value={b.description}
                  placeholder="Description"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      benefits: content.benefits.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)),
                    })
                  }
                  className="rounded-md border border-brand-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                />
                <select
                  value={b.icon}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      benefits: content.benefits.map((x, idx) => (idx === i ? { ...x, icon: e.target.value } : x)),
                    })
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
            onClick={() =>
              setContent({
                ...content,
                benefits: [...content.benefits, { title: "", description: "", icon: "ShieldCheck", order: content.benefits.length }],
              })
            }
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-red hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add benefit
          </button>
        </Card>

        <Card title="Why Choose Us">
          <Field label="Heading" value={content.whyChooseUs.heading} onChange={(v) => setContent({ ...content, whyChooseUs: { ...content.whyChooseUs, heading: v } })} />
          <Field label="Content" value={content.whyChooseUs.content} textarea onChange={(v) => setContent({ ...content, whyChooseUs: { ...content.whyChooseUs, content: v } })} />
          <ImageUpload label="Image" value={content.whyChooseUs.imageMediaId} onChange={(id) => setContent({ ...content, whyChooseUs: { ...content.whyChooseUs, imageMediaId: id } })} />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Key Points</label>
            <ListEditor items={content.whyChooseUs.points} onChange={(v) => setContent({ ...content, whyChooseUs: { ...content.whyChooseUs, points: v } })} />
          </div>
        </Card>

        <Card title="Process Steps">
          {content.process.map((step, i) => (
            <div key={i} className="rounded-md border border-brand-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-brand-gray-500">Step {i + 1}</span>
                <button
                  onClick={() => setContent({ ...content, process: content.process.filter((_, idx) => idx !== i) })}
                  className="text-brand-gray-500 hover:text-brand-red"
                  aria-label="Remove step"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={step.title}
                  placeholder="Title"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      process: content.process.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)),
                    })
                  }
                  className="rounded-md border border-brand-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                />
                <input
                  value={step.description}
                  placeholder="Description"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      process: content.process.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)),
                    })
                  }
                  className="rounded-md border border-brand-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                />
                <select
                  value={step.icon}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      process: content.process.map((x, idx) => (idx === i ? { ...x, icon: e.target.value } : x)),
                    })
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
              <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-md bg-brand-black text-white">
                <Icon name={step.icon} className="h-4 w-4" />
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              setContent({
                ...content,
                process: [...content.process, { title: "", description: "", icon: "ClipboardList", order: content.process.length }],
              })
            }
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-red hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add step
          </button>
        </Card>

        <Card title="Before & After / Results Section" description="Images pulled automatically from Gallery items tagged 'Before & After'.">
          <Field label="Heading" value={content.beforeAfter.heading} onChange={(v) => setContent({ ...content, beforeAfter: { ...content.beforeAfter, heading: v } })} />
          <Field label="Description" value={content.beforeAfter.description} textarea onChange={(v) => setContent({ ...content, beforeAfter: { ...content.beforeAfter, description: v } })} />
        </Card>

        <Card
          title="Service Area"
          description="The actual list of towns/areas served is managed on the Site Settings page (Service Areas & Google Reviews section) so it can also be reused in the footer."
        >
          <Field label="Heading" value={content.serviceArea.heading} onChange={(v) => setContent({ ...content, serviceArea: { ...content.serviceArea, heading: v } })} />
          <Field label="Description" value={content.serviceArea.description} textarea onChange={(v) => setContent({ ...content, serviceArea: { ...content.serviceArea, description: v } })} />
        </Card>

        <Card title="Final CTA Section">
          <Field label="Heading" value={content.cta.heading} onChange={(v) => setContent({ ...content, cta: { ...content.cta, heading: v } })} />
          <Field label="Description" value={content.cta.description} textarea onChange={(v) => setContent({ ...content, cta: { ...content.cta, description: v } })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button Text" value={content.cta.buttonText} onChange={(v) => setContent({ ...content, cta: { ...content.cta, buttonText: v } })} />
            <Field label="Button URL" value={content.cta.buttonUrl} onChange={(v) => setContent({ ...content, cta: { ...content.cta, buttonUrl: v } })} />
          </div>
          <ImageUpload label="Background Image" value={content.cta.backgroundImageMediaId} onChange={(id) => setContent({ ...content, cta: { ...content.cta, backgroundImageMediaId: id } })} />
        </Card>

        <Card title="SEO Settings" description="Overrides defaults from Site Settings for this page only.">
          <Field label="SEO Title" value={seo.title} onChange={(v) => setSeo({ ...seo, title: v })} />
          <Field label="Meta Description" value={seo.metaDescription} textarea onChange={(v) => setSeo({ ...seo, metaDescription: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="OG Title" value={seo.ogTitle} onChange={(v) => setSeo({ ...seo, ogTitle: v })} />
            <Field label="OG Description" value={seo.ogDescription} onChange={(v) => setSeo({ ...seo, ogDescription: v })} />
          </div>
          <Field label="Canonical URL" value={seo.canonicalUrl} onChange={(v) => setSeo({ ...seo, canonicalUrl: v })} />
        </Card>
      </div>
    </div>
  );
}
