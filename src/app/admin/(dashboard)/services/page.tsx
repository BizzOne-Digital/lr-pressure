"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wrench, Star, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { PageIntroPanel } from "@/components/admin/PageIntroPanel";
import { Icon, ICON_NAMES } from "@/components/icon-map";
import { mediaUrl } from "@/lib/media-url";

interface ServiceItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageMediaId?: string;
  icon: string;
  featured: boolean;
  order: number;
  active: boolean;
}

const EMPTY: Omit<ServiceItem, "_id"> = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  imageMediaId: undefined,
  icon: "Sparkles",
  featured: false,
  order: 0,
  active: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ServicesAdminPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/services")
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
    setModalOpen(true);
  }

  function openEdit(item: ServiceItem) {
    setEditing(item);
    setForm(item);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/services/${editing._id}` : "/api/admin/services",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const json = await res.json();
      if (json.success) {
        showToast("success", editing ? "Service updated." : "Service created.");
        setModalOpen(false);
        load();
      } else {
        showToast("error", json.error || "Failed to save service.");
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
      const res = await fetch(`/api/admin/services/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Service deleted.");
        setDeleteTarget(null);
        load();
      } else {
        showToast("error", json.error || "Failed to delete service.");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function reorder(item: ServiceItem, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s._id === item._id);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    await Promise.all([
      fetch(`/api/admin/services/${a._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/services/${b._id}`, {
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
          <h1 className="font-heading text-2xl font-bold text-brand-black">Services</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Manage the services shown across your site.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark"
        >
          <Plus className="h-4 w-4" /> New Service
        </button>
      </div>

      <div className="mt-6">
        <PageIntroPanel pageKey="services" title="Services Page" />
        {loading ? (
          <TableSkeleton />
        ) : sortedItems.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No services yet"
            description="Add your first service to display it on the homepage and services page."
            action={
              <button onClick={openCreate} className="text-sm font-semibold text-brand-red hover:underline">
                Add a service
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
                      <Icon name={item.icon} className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-brand-black">
                      {item.name}
                      {item.featured && <Star className="h-3.5 w-3.5 fill-brand-red text-brand-red" />}
                      {!item.active && (
                        <span className="rounded-full bg-brand-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-gray-600">
                          Inactive
                        </span>
                      )}
                    </p>
                    <p className="truncate text-sm text-brand-gray-600">/services/{item.slug}</p>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Service" : "New Service"} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Name</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editing ? form.slug : slugify(e.target.value),
                  })
                }
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Short Description</label>
            <input
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Full Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Icon</label>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              >
                {ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-md bg-brand-black text-white">
                <Icon name={form.icon} className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured
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
              disabled={saving || !form.name || !form.slug}
              className="rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Service"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
