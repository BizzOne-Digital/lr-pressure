import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-gray-200 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gray-50 text-brand-gray-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-heading text-base font-bold text-brand-black">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-brand-gray-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
