"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus, Save, Loader2, Eye, EyeOff, PanelTop } from "lucide-react";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/ToastProvider";

interface NavItem {
  label: string;
  href: string;
  order: number;
  visible: boolean;
  showInHeader: boolean;
}

export default function NavigationPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/navigation")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setItems([...json.data.items].sort((a, b) => a.order - b.order));
      })
      .finally(() => setLoading(false));
  }, []);

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next.map((item, i) => ({ ...item, order: i })));
  }

  function update(index: number, patch: Partial<NavItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    setItems(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })));
  }

  function addItem() {
    setItems([
      ...items,
      { label: "New Link", href: "/", order: items.length, visible: true, showInHeader: true },
    ]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Navigation updated.");
        setItems([...json.data.items].sort((a: NavItem, b: NavItem) => a.order - b.order));
      } else {
        showToast("error", json.error || "Failed to save navigation.");
      }
    } catch {
      showToast("error", "Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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
          <h1 className="font-heading text-2xl font-bold text-brand-black">Navigation</h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Control the menu links shown in the header and footer. Use the eye icon to hide a
            link everywhere, or the panel icon to keep it in the footer only (for a minimal
            header menu).
          </p>
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

      <div className="mt-6 space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-gray-200 bg-white p-4"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded p-1 text-brand-gray-400 hover:text-brand-red disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="rounded p-1 text-brand-gray-400 hover:text-brand-red disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
            <input
              value={item.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label"
              className="w-40 rounded-md border border-brand-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
            />
            <input
              value={item.href}
              onChange={(e) => update(i, { href: e.target.value })}
              placeholder="/path"
              className="flex-1 min-w-[10rem] rounded-md border border-brand-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
            />
            <button
              onClick={() => update(i, { visible: !item.visible })}
              className="rounded p-1.5 text-brand-gray-500 hover:text-brand-red"
              aria-label={item.visible ? "Hide everywhere" : "Show"}
              title={item.visible ? "Visible (click to hide everywhere)" : "Hidden everywhere"}
            >
              {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={() => update(i, { showInHeader: !item.showInHeader })}
              className={`rounded p-1.5 hover:text-brand-red ${
                item.showInHeader ? "text-brand-red" : "text-brand-gray-400"
              }`}
              aria-label={item.showInHeader ? "Remove from header (keep in footer)" : "Show in header"}
              title={
                item.showInHeader
                  ? "In header menu (click to keep footer-only)"
                  : "Footer-only (click to add to header)"
              }
            >
              <PanelTop className="h-4 w-4" />
            </button>
            <button
              onClick={() => remove(i)}
              className="rounded p-1.5 text-brand-gray-500 hover:text-brand-red"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-brand-gray-200 px-4 py-2.5 text-sm font-semibold text-brand-gray-600 hover:border-brand-red hover:text-brand-red"
      >
        <Plus className="h-4 w-4" /> Add Menu Item
      </button>
    </div>
  );
}
