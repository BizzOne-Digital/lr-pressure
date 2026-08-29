import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-brand-gray-200 bg-white p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${
          accent ? "bg-brand-red text-white" : "bg-brand-black text-white"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-brand-black">{value}</p>
        <p className="text-xs font-medium text-brand-gray-600">{label}</p>
      </div>
    </div>
  );
}
