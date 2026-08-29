"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Inbox, ArrowUpDown } from "lucide-react";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";

const STATUSES = ["New", "Contacted", "Quote Sent", "Scheduled", "Completed", "Cancelled"];

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-amber-100 text-amber-700",
  "Quote Sent": "bg-purple-100 text-purple-700",
  Scheduled: "bg-indigo-100 text-indigo-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-200 text-gray-600",
};

interface LeadRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  serviceNeeded: string;
  status: string;
  createdAt: string;
}

export default function LeadsPage() {
  const [items, setItems] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("sort", sort);
    fetch(`/api/admin/leads?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setItems(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [search, status, sort]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-black">Leads</h1>
      <p className="mt-1 text-sm text-brand-gray-600">
        {total} total quote request{total !== 1 ? "s" : ""}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[14rem]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full rounded-md border border-brand-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-brand-gray-200 px-3 py-2.5 text-sm focus:border-brand-red focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
          className="flex items-center gap-2 rounded-md border border-brand-gray-200 px-3 py-2.5 text-sm font-semibold text-brand-gray-600 hover:border-brand-red hover:text-brand-red"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sort === "newest" ? "Newest first" : "Oldest first"}
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No leads found"
            description={
              search || status
                ? "Try adjusting your search or filter."
                : "New quote requests submitted through your website will show up here."
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-brand-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brand-gray-200 bg-brand-gray-50 text-xs font-bold uppercase text-brand-gray-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Received</th>
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr key={lead._id} className="border-b border-brand-gray-200 last:border-0 hover:bg-brand-gray-50">
                    <td className="px-4 py-3 font-semibold text-brand-black">
                      <Link href={`/admin/leads/${lead._id}`} className="hover:text-brand-red">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-brand-gray-600">
                      <div>{lead.email}</div>
                      <div className="text-xs">{lead.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-brand-gray-600">{lead.serviceNeeded || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-gray-600">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
