"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, MessageSquareQuote, Star } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { PageIntroPanel } from "@/components/admin/PageIntroPanel";

interface Testimonial {
  _id: string;
  customerName: string;
  testimonialText: string;
  rating: number;
  photoMediaId?: string;
  location: string;
  isPlaceholder: boolean;
  featured: boolean;
  active: boolean;
  order: number;
}

const EMPTY: Omit<Testimonial, "_id"> = {
  customerName: "",
  testimonialText: "",
  rating: 5,
  photoMediaId: undefined,
  location: "",
  isPlaceholder: true,
  featured: false,
  active: true,
  order: 0,
};

export default function TestimonialsAdminPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/testimonials")
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
    setForm({ ...EMPTY, order: items.length, isPlaceholder: false });
    setModalOpen(true);
  }

  function openEdit(item: Testimonial) {
    setEditing(item);
    setForm(item);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/testimonials/${editing._id}` : "/api/admin/testimonials",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const json = await res.json();
      if (json.success) {
        showToast("success", editing ? "Testimonial updated." : "Testimonial added.");
        setModalOpen(false);
        load();
      } else {
        showToast("error", json.error || "Failed to save testimonial.");
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
      const res = await fetch(`/api/admin/testimonials/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Testimonial removed.");
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
          <h1 className="font-heading text-2xl font-bold text-brand-black">Testimonials</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Manage customer reviews shown on the homepage and the full Reviews page.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      <div className="mt-6">
        <PageIntroPanel pageKey="reviews" title="Reviews Page" />
        {loading ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No testimonials yet"
            description="Add real customer reviews as they come in, or placeholder examples to show the layout."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item._id} className="rounded-lg border border-brand-gray-200 bg-white p-5">
                <div className="flex gap-0.5 text-brand-red">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5" fill={i < item.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-brand-gray-700">{item.testimonialText}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-black">{item.customerName}</p>
                    <div className="flex gap-1.5 text-[10px] font-bold uppercase text-brand-gray-500">
                      {item.isPlaceholder && <span className="text-amber-600">Placeholder</span>}
                      {!item.active && <span>Hidden</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-md p-2 text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-red"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="rounded-md p-2 text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-red"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Testimonial" : "Add Testimonial"}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Customer Name</label>
              <input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Testimonial</label>
            <textarea
              rows={4}
              value={form.testimonialText}
              onChange={(e) => setForm({ ...form, testimonialText: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Rating</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} star{r !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <ImageUpload label="Photo (optional)" value={form.photoMediaId} onChange={(id) => setForm({ ...form, photoMediaId: id })} />
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <input
                type="checkbox"
                checked={form.isPlaceholder}
                onChange={(e) => setForm({ ...form, isPlaceholder: e.target.checked })}
              />
              Mark as placeholder
            </label>
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
              disabled={saving || !form.customerName || !form.testimonialText}
              className="rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Testimonial"
        description={`Remove the testimonial from "${deleteTarget?.customerName}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
