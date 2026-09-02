"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderKanban, Star, ArrowUp, ArrowDown, MapPin } from "lucide-react";
import Image from "next/image";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { PageIntroPanel } from "@/components/admin/PageIntroPanel";
import { mediaUrl } from "@/lib/media-url";

interface ProjectItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  imageMediaId?: string;
  beforeImageMediaId?: string;
  afterImageMediaId?: string;
  location: string;
  serviceSlug: string;
  featured: boolean;
  order: number;
  active: boolean;
}

interface ServiceOption {
  name: string;
  slug: string;
}

const EMPTY: Omit<ProjectItem, "_id"> = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  imageMediaId: undefined,
  beforeImageMediaId: undefined,
  afterImageMediaId: undefined,
  location: "",
  serviceSlug: "",
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

export default function ProjectsAdminPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setItems(json.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    load();
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setServices(json.data.map((s: ServiceOption) => ({ name: s.name, slug: s.slug })));
        }
      });
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(item: ProjectItem) {
    setEditing(item);
    setForm(item);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/projects/${editing._id}` : "/api/admin/projects",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const json = await res.json();
      if (json.success) {
        showToast("success", editing ? "Project updated." : "Project created.");
        setModalOpen(false);
        load();
      } else {
        showToast("error", json.error || "Failed to save project.");
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
      const res = await fetch(`/api/admin/projects/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Project deleted.");
        setDeleteTarget(null);
        load();
      } else {
        showToast("error", json.error || "Failed to delete project.");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function reorder(item: ProjectItem, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s._id === item._id);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    await Promise.all([
      fetch(`/api/admin/projects/${a._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/projects/${b._id}`, {
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
          <h1 className="font-heading text-2xl font-bold text-brand-black">Projects</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Detailed case studies of real completed jobs. Only add projects you&rsquo;ve actually
            done — leave this list empty until you have real photos and details to share.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      <div className="mt-6">
        <PageIntroPanel pageKey="projects" title="Projects Page" />
        {loading ? (
          <TableSkeleton />
        ) : sortedItems.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Add a real completed job with photos to feature it as a case study on the Projects page."
            action={
              <button onClick={openCreate} className="text-sm font-semibold text-brand-red hover:underline">
                Add a project
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item, i) => {
              const img = mediaUrl(item.imageMediaId) || mediaUrl(item.afterImageMediaId);
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
                    <Image src={img} alt={item.title} width={64} height={64} className="h-16 w-16 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-brand-gray-50 text-brand-gray-400">
                      <FolderKanban className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-brand-black">
                      {item.title}
                      {item.featured && <Star className="h-3.5 w-3.5 fill-brand-red text-brand-red" />}
                      {!item.active && (
                        <span className="rounded-full bg-brand-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-gray-600">
                          Inactive
                        </span>
                      )}
                    </p>
                    <p className="truncate text-sm text-brand-gray-600">
                      /projects/{item.slug}
                      {item.location && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {item.location}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-md p-2 text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-red"
                      aria-label={`Edit ${item.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="rounded-md p-2 text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-red"
                      aria-label={`Delete ${item.title}`}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Project" : "New Project"} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Title</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: editing ? form.slug : slugify(e.target.value),
                  })
                }
                placeholder="e.g. Full Exterior Refresh — Split-Level Home"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Philadelphia, PA"
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Related Service</label>
              <select
                value={form.serviceSlug}
                onChange={(e) => setForm({ ...form, serviceSlug: e.target.value })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              >
                <option value="">None</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Summary</label>
            <input
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Short one-line summary shown on the Projects listing page"
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Full Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what was done, the challenge, and the results — real details only."
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-brand-black">Cover Image</p>
            <ImageUpload
              label="Cover Image"
              value={form.imageMediaId}
              onChange={(id) => setForm({ ...form, imageMediaId: id })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-brand-black">Before Photo</p>
              <ImageUpload
                label="Before Photo"
                value={form.beforeImageMediaId}
                onChange={(id) => setForm({ ...form, beforeImageMediaId: id })}
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-brand-black">After Photo</p>
              <ImageUpload
                label="After Photo"
                value={form.afterImageMediaId}
                onChange={(id) => setForm({ ...form, afterImageMediaId: id })}
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-brand-gray-500">
            Add real before/after photos to show a side-by-side comparison, or just a cover image if
            you only have the finished result.
          </p>

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
              disabled={saving || !form.title || !form.slug}
              className="rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Project"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
