"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/ToastProvider";

interface Settings {
  businessName: string;
  logoMediaId?: string;
  faviconMediaId?: string;
  phone: string;
  email: string;
  address: string;
  socialLinks: { facebook?: string; instagram?: string; google?: string; tiktok?: string; youtube?: string };
  primaryCtaText: string;
  primaryCtaUrl: string;
  footerText: string;
  businessDescription: string;
  seoDefaults: { title?: string; description?: string; ogImageMediaId?: string };
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSettings(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Site settings saved.");
        setSettings(json.data);
      } else {
        showToast("error", json.error || "Failed to save settings.");
      }
    } catch {
      showToast("error", "Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
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
          <h1 className="font-heading text-2xl font-bold text-brand-black">Site Settings</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Global business information used across the site.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      <div className="mt-8 space-y-8">
        <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-brand-black">Branding</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <ImageUpload
              label="Logo"
              value={settings.logoMediaId}
              onChange={(id) => setSettings({ ...settings, logoMediaId: id })}
            />
            <ImageUpload
              label="Favicon"
              value={settings.faviconMediaId}
              onChange={(id) => setSettings({ ...settings, faviconMediaId: id })}
            />
          </div>
          <TextField
            label="Business Name"
            value={settings.businessName}
            onChange={(v) => setSettings({ ...settings, businessName: v })}
          />
          <TextArea
            label="Business Description"
            value={settings.businessDescription}
            onChange={(v) => setSettings({ ...settings, businessDescription: v })}
          />
        </section>

        <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-brand-black">Contact Information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Phone"
              value={settings.phone}
              onChange={(v) => setSettings({ ...settings, phone: v })}
            />
            <TextField
              label="Email"
              value={settings.email}
              onChange={(v) => setSettings({ ...settings, email: v })}
            />
          </div>
          <TextField
            label="Address"
            value={settings.address}
            onChange={(v) => setSettings({ ...settings, address: v })}
          />
        </section>

        <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-brand-black">Primary Call To Action</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Button Text"
              value={settings.primaryCtaText}
              onChange={(v) => setSettings({ ...settings, primaryCtaText: v })}
            />
            <TextField
              label="Button URL"
              value={settings.primaryCtaUrl}
              onChange={(v) => setSettings({ ...settings, primaryCtaUrl: v })}
            />
          </div>
        </section>

        <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-brand-black">Social Links</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(["facebook", "instagram", "google", "tiktok", "youtube"] as const).map((key) => (
              <TextField
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={settings.socialLinks?.[key] || ""}
                onChange={(v) =>
                  setSettings({ ...settings, socialLinks: { ...settings.socialLinks, [key]: v } })
                }
              />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-brand-black">Footer & Default SEO</h2>
          <TextArea
            label="Footer Text"
            value={settings.footerText}
            onChange={(v) => setSettings({ ...settings, footerText: v })}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Default SEO Title"
              value={settings.seoDefaults?.title || ""}
              onChange={(v) =>
                setSettings({ ...settings, seoDefaults: { ...settings.seoDefaults, title: v } })
              }
            />
            <TextField
              label="Default Meta Description"
              value={settings.seoDefaults?.description || ""}
              onChange={(v) =>
                setSettings({ ...settings, seoDefaults: { ...settings.seoDefaults, description: v } })
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-sm font-semibold text-brand-black">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-sm font-semibold text-brand-black">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
      />
    </div>
  );
}
