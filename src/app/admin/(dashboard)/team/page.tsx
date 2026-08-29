"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { PageIntroPanel } from "@/components/admin/PageIntroPanel";
import { mediaUrl } from "@/lib/media-url";

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  photoMediaId?: string;
  socialLinks: { facebook?: string; instagram?: string; linkedin?: string };
  active: boolean;
  order: number;
}

const EMPTY: Omit<TeamMember, "_id"> = {
  name: "",
  role: "",
  bio: "",
  photoMediaId: undefined,
  socialLinks: {},
  active: true,
  order: 0,
};

export default function TeamAdminPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/team")
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

  function openEdit(item: TeamMember) {
    setEditing(item);
    setForm(item);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/team/${editing._id}` : "/api/admin/team", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", editing ? "Team member updated." : "Team member added.");
        setModalOpen(false);
        load();
      } else {
        showToast("error", json.error || "Failed to save team member.");
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
      const res = await fetch(`/api/admin/team/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Team member removed.");
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
          <h1 className="font-heading text-2xl font-bold text-brand-black">Team</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Manage the profiles shown on the Our Team page.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark"
        >
          <Plus className="h-4 w-4" /> Add Team Member
        </button>
      </div>

      <div className="mt-6">
        <PageIntroPanel pageKey="team" title="Team Page" />
        {loading ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Add placeholder or real profiles to populate the Our Team page."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const img = mediaUrl(item.photoMediaId);
              return (
                <div key={item._id} className="rounded-lg border border-brand-gray-200 bg-white p-5">
                  <div className="flex items-center gap-4">
                    {img ? (
                      <Image src={img} alt={item.name} width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-black text-sm font-bold text-white">
                        {item.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-brand-black">{item.name}</p>
                      <p className="truncate text-sm text-brand-gray-600">{item.role}</p>
                      {!item.active && (
                        <span className="mt-1 inline-block rounded-full bg-brand-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Team Member" : "Add Team Member"}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-black">Role</label>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-black">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <ImageUpload label="Photo" value={form.photoMediaId} onChange={(id) => setForm({ ...form, photoMediaId: id })} />
          <div className="grid gap-4 sm:grid-cols-3">
            {(["facebook", "instagram", "linkedin"] as const).map((key) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-semibold capitalize text-brand-black">{key}</label>
                <input
                  value={form.socialLinks[key] || ""}
                  onChange={(e) =>
                    setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: e.target.value } })
                  }
                  className="w-full rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
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
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Team Member"
        description={`Remove "${deleteTarget?.name}" from the team page?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
