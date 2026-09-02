"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, DollarSign, Star, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { PageIntroPanel } from "@/components/admin/PageIntroPanel";
import { mediaUrl } from "@/lib/media-url";

interface ServicePlanItem {
  _id: string;
  name: string;
  tagline: string;
  frequency: string;
  features: string[];
  priceLabel: string;
  imageMediaId?: string;
  highlighted: boolean;
  order: number;
  active: boolean;
}

const EMPTY: Omit<ServicePlanItem, "_id"> = {
  name: "",
  tagline: "",
  frequency: "",
  features: [],
  priceLabel: "Contact for Pricing",
  imageMediaId: undefined,
  highlighted: false,
  order: 0,
  active: true,
};

export default function ServicePlansAdminPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ServicePlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServicePlanItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [featuresText, setFeaturesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServicePlanItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/service-plans")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setItems(json.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFeaturesText("");
    setModalOpen(true);
  }

  function openEdit(item: ServicePlanItem) {
    setEditing(item);
    setForm(item);
    setFeaturesText(item.features.join("\n"));
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: featuresText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      };
      const res = await fetch(
        editing ? `/api/admin/service-plans/${editing._id}` : "/api/admin/service-plans",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (json.success) {
        showToast("success", editing ? "Service plan updated." : "Service plan created.");
        setModalOpen(false);
        load();
      } else {
        showToast("error", json.error || "Failed to save service plan.");
      }
    } catch {
      showToast("error", "Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/service-plans/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Service plan deleted.");
        setDeleteTarget(null);
        load();
      } else {
        showToast("error", json.error || "Failed to delete service plan.");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function reorder(item: ServicePlanItem, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s._id === item._id);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    await Promise.all([
      fetch(`/api/admin/service-plans/${a._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/service-plans/${b._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    load();
  }

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-black">Service Plans</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Manage recurring maintenance plan tiers shown on the Service Plans page. Pricing is
            free text — no numbers are ever invented automatically, so leave the default
            &ldquo;Contact for Pricing&rdquo; label until you have real pricing to publish.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark"
        >
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </div>

      <div className="mt-6">
        <PageIntroPanel pageKey="service-plans" title="Service Plans Page" />
        {loading ? (
          <TableSkeleton />
        ) : sortedItems.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No service plans yet"
            description="Add your first maintenance plan tier to display it on the Service Plans page."
            action={
              <button onClick={openCreate} className="text-sm font-semibold text-brand-red hover:underline">
                Add a plan
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item, i) => {
              const img = mediaUrl(item.imageMediaId);
              return (
                <div
                  key={item._id}
                  className="flex flex-wrap items-center gap-4 rounded-lg border border-brand-gray-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => reorder(item, -1)}
                      disabled={i === 0}
                      className="rounded p-1 text-brand-gray-400 hover:text-brand-red disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => reorder(item, 1)}
                      disabled={i === sortedItems.length - 1}
                      className="rounded p-1 text-brand-gray-400 hover:text-brand-red disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  {img ? (
                    <Image src={img} alt={item.name} width={64} height={64} className="h-16 w-16 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-brand-gray-50 text-brand-gray-400">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-brand-black">
                      {item.name}
                      {item.highlighted && <Star className="h-3.5 w-3.5 fill-brand-red text-brand-red" />}
                      {!item.active && (
                        <span className="rounded-full bg-brand-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-gray-600">
                          Inactive
                        </span>
                      )}
                    </p>
                    <p className="truncate text-sm text-brand-gray-600">
                      {item.frequency ? `${item.frequency} — ` : ""}
                      {item.priceLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-md p-2 text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-red"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="rounded-md p-2 text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-red"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Service Plan" : "New Service Plan"} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Plan Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Seasonal Refresh"
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Frequency</label>
              <input
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                placeholder="e.g. Quarterly, Twice a Year, Annual"
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Tagline</label>
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="Short one-line summary of this plan"
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">
              Features (one per line)
            </label>
            <textarea
              rows={5}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder={"House wash — 2x per year\nRoof soft-wash — 1x per year\nDriveway & walkway cleaning"}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUpload
              label="Image"
              value={form.imageMediaId}
              onChange={(id) => setForm({ ...form, imageMediaId: id })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Price Label</label>
              <input
                value={form.priceLabel}
                onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
                placeholder="Contact for Pricing"
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-brand-gray-500">
                Free text, shown as-is. Only enter a real number once you have confirmed pricing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <input
                type="checkbox"
                checked={form.highlighted}
                onChange={(e) => setForm({ ...form, highlighted: e.target.checked })}
              />
              Highlighted (&ldquo;Most Popular&rdquo;)
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-brand-gray-200 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-brand-gray-600 hover:bg-brand-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.name}
              className="rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Service Plan"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
