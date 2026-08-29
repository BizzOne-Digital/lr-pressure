"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Images, Star } from "lucide-react";
import Image from "next/image";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { mediaUrl } from "@/lib/media-url";
import { GALLERY_CATEGORIES } from "@/lib/constants";

interface GalleryItem {
  _id: string;
  title: string;
  caption: string;
  category: string;
  imageMediaId: string;
  featured: boolean;
  order: number;
  active: boolean;
}

const EMPTY: Omit<GalleryItem, "_id" | "imageMediaId"> & { imageMediaId?: string } = {
  title: "",
  caption: "",
  category: GALLERY_CATEGORIES[0],
  imageMediaId: undefined,
  featured: false,
  order: 0,
  active: true,
};

export default function GalleryAdminPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/gallery")
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
    setForm({ ...EMPTY, order: items.length });
    setModalOpen(true);
  }

  function openEdit(item: GalleryItem) {
    setEditing(item);
    setForm(item);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.imageMediaId) {
      showToast("error", "Please upload an image first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/gallery/${editing._id}` : "/api/admin/gallery", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", editing ? "Image updated." : "Image added to gallery.");
        setModalOpen(false);
        load();
      } else {
        showToast("error", json.error || "Failed to save gallery item.");
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
      const res = await fetch(`/api/admin/gallery/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Image removed from gallery.");
        setDeleteTarget(null);
        load();
      } else {
        showToast("error", json.error || "Failed to delete.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-black">Gallery</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Manage the project photos shown in the homepage gallery.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark"
        >
          <Plus className="h-4 w-4" /> Add Image
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No gallery images yet"
            description="Upload before/after photos and project shots to showcase your work."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const img = mediaUrl(item.imageMediaId);
              return (
                <div key={item._id} className="group relative overflow-hidden rounded-lg border border-brand-gray-200 bg-white">
                  <div className="relative aspect-square w-full">
                    {img && (
                      <Image src={img} alt={item.title || item.category} fill className="object-cover" />
                    )}
                    {!item.active && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-bold uppercase text-white">
                        Hidden
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="flex items-center gap-1 truncate text-xs font-bold text-brand-black">
                      {item.title || item.category}
                      {item.featured && <Star className="h-3 w-3 fill-brand-red text-brand-red" />}
                    </p>
                    <p className="truncate text-[11px] text-brand-gray-500">{item.category}</p>
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-full bg-white p-1.5 text-brand-black shadow"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="rounded-full bg-white p-1.5 text-brand-red shadow"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Image" : "Add Gallery Image"}>
        <div className="space-y-4">
          <ImageUpload label="Image" value={form.imageMediaId} onChange={(id) => setForm({ ...form, imageMediaId: id })} />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Caption</label>
            <input
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            >
              {GALLERY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-6">
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
              Visible
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
              disabled={saving}
              className="rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Image"
        description="Remove this image from the gallery? This cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
