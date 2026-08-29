"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  MailOpen,
  PhoneCall,
  CalendarCheck,
  CheckCircle2,
  Wrench,
  Images,
  MessageSquareQuote,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Skeleton } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";

interface DashboardData {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  scheduledJobs: number;
  completedJobs: number;
  totalServices: number;
  galleryImages: number;
  testimonials: number;
  recentLeads: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-black">Dashboard</h1>
      <p className="mt-1 text-sm text-brand-gray-600">
        A quick overview of leads and content across your site.
      </p>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Leads" value={data.totalLeads} icon={Inbox} accent />
            <StatCard label="New Leads" value={data.newLeads} icon={MailOpen} />
            <StatCard label="Contacted" value={data.contactedLeads} icon={PhoneCall} />
            <StatCard label="Scheduled Jobs" value={data.scheduledJobs} icon={CalendarCheck} />
            <StatCard label="Completed Jobs" value={data.completedJobs} icon={CheckCircle2} />
            <StatCard label="Services" value={data.totalServices} icon={Wrench} />
            <StatCard label="Gallery Images" value={data.galleryImages} icon={Images} />
            <StatCard label="Testimonials" value={data.testimonials} icon={MessageSquareQuote} />
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-brand-black">Recent Leads</h2>
              <Link href="/admin/leads" className="text-sm font-semibold text-brand-red hover:underline">
                View all
              </Link>
            </div>

            {data.recentLeads.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={Inbox}
                  title="No leads yet"
                  description="New quote requests submitted through your website will show up here."
                />
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-lg border border-brand-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-brand-gray-200 bg-brand-gray-50 text-xs font-bold uppercase text-brand-gray-600">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLeads.map((lead) => (
                      <tr key={lead._id} className="border-b border-brand-gray-200 last:border-0">
                        <td className="px-4 py-3 font-semibold text-brand-black">
                          <Link href={`/admin/leads/${lead._id}`} className="hover:text-brand-red">
                            {lead.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-brand-gray-600">
                          {lead.email} &middot; {lead.phone}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-brand-gray-50 px-2.5 py-1 text-xs font-semibold text-brand-black">
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
        </>
      ) : (
        <p className="mt-8 text-sm text-red-600">Failed to load dashboard data.</p>
      )}
    </div>
  );
}
