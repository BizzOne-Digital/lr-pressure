"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Trash2, Phone, Mail, MapPin, Calendar, Wrench } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/ToastProvider";
import { mediaUrl } from "@/lib/media-url";

const STATUSES = ["New", "Contacted", "Quote Sent", "Scheduled", "Completed", "Cancelled"];

interface LeadNote {
  text: string;
  createdAt: string;
}

interface LeadDetail {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  serviceNeeded: string;
  preferredDate: string;
  message: string;
  imageMediaId?: string;
  status: string;
  notes: LeadNote[];
  createdAt: string;
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/leads/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setLead(json.data);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    load();
  }, [load]);

  async function updateStatus(status: string) {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/leads/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        setLead(json.data);
        showToast("success", "Status updated.");
      } else {
        showToast("error", json.error || "Failed to update status.");
      }
    } finally {
      setSavingStatus(false);
    }
  }

  async function addNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/leads/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setLead(json.data);
        setNoteText("");
        showToast("success", "Note added.");
      } else {
        showToast("error", json.error || "Failed to add note.");
      }
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${params.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Lead deleted.");
        router.push("/admin/leads");
      } else {
        showToast("error", json.error || "Failed to delete lead.");
      }
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !lead) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const photo = mediaUrl(lead.imageMediaId);

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => router.push("/admin/leads")}
        className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-gray-600 hover:text-brand-red"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Leads
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-black">{lead.name}</h1>
          <p className="text-sm text-brand-gray-600">
            Submitted {new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={lead.status}
            disabled={savingStatus}
            onChange={(e) => updateStatus(e.target.value)}
            className="rounded-md border border-brand-gray-200 px-3 py-2.5 text-sm font-semibold focus:border-brand-red focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-md p-2.5 text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-red"
            aria-label="Delete lead"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
            <h2 className="font-heading text-base font-bold text-brand-black">Message</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-gray-700">
              {lead.message || "No message provided."}
            </p>
            {photo && (
              <div className="mt-4">
                <Image
                  src={photo}
                  alt="Lead attachment"
                  width={240}
                  height={180}
                  className="rounded-md object-cover"
                />
              </div>
            )}
          </section>

          <section className="rounded-lg border border-brand-gray-200 bg-white p-6">
            <h2 className="font-heading text-base font-bold text-brand-black">Internal Notes</h2>
            <div className="mt-3 space-y-3">
              {lead.notes.length === 0 ? (
                <p className="text-sm text-brand-gray-500">No notes yet.</p>
              ) : (
                lead.notes.map((note, i) => (
                  <div key={i} className="rounded-md bg-brand-gray-50 p-3 text-sm">
                    <p className="text-brand-gray-800">{note.text}</p>
                    <p className="mt-1 text-xs text-brand-gray-400">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add an internal note..."
                className="flex-1 rounded-md border border-brand-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-red focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && addNote()}
              />
              <button
                onClick={addNote}
                disabled={savingNote || !noteText.trim()}
                className="rounded-md bg-brand-black px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-charcoal-2 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-brand-gray-200 bg-white p-5">
            <h3 className="font-heading text-sm font-bold text-brand-black">Contact Details</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                <a href={`tel:${lead.phone}`} className="hover:text-brand-red">
                  {lead.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                <a href={`mailto:${lead.email}`} className="break-all hover:text-brand-red">
                  {lead.email}
                </a>
              </li>
              {lead.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                  {lead.address}
                </li>
              )}
              {lead.serviceNeeded && (
                <li className="flex items-start gap-2.5">
                  <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                  {lead.serviceNeeded}
                </li>
              )}
              {lead.preferredDate && (
                <li className="flex items-start gap-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                  {lead.preferredDate}
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Lead"
        description="This will permanently delete this lead and its notes. This cannot be undone."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
